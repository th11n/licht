import { Hono } from "hono";
import crypto from "node:crypto";
import type { DbClient } from "../db/client";

type CreateAppOptions = {
    db: DbClient;
};

export function createApp({ db }: CreateAppOptions) {
    const app = new Hono();

    app.get("/health", (c) => {
        const dbCheck = db.query("SELECT 1 as ok").get();

        return c.json({
            ok: true,
            service: "licht-core",
            db: dbCheck,
            timestamp: new Date().toISOString(),
        });
    });

    app.get("/projects", (c) => {
        const projects = db.query("SELECT * FROM projects ORDER BY updated_at DESC").all();
        return c.json({ projects });
    });

    app.post("/projects", async (c) => {
        const body = await c.req.json();
        if (!body.name) return c.json({ error: "Name is required" }, 400);

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        db.query("INSERT INTO projects (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(id, body.name, now, now);
        
        const project = db.query("SELECT * FROM projects WHERE id = ?").get(id);
        return c.json({ project }, 201);
    });

    app.get("/projects/:projectId/environments", (c) => {
        const projectId = c.req.param("projectId");
        const environments = db.query("SELECT * FROM environments WHERE project_id = ? ORDER BY created_at ASC").all(projectId);
        return c.json({ environments });
    });

    app.post("/projects/:projectId/environments", async (c) => {
        const projectId = c.req.param("projectId");
        const body = await c.req.json();
        if (!body.name) return c.json({ error: "Name is required" }, 400);

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        db.query("INSERT INTO environments (id, project_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(id, projectId, body.name, now, now);
        
        const environment = db.query("SELECT * FROM environments WHERE id = ?").get(id);
        return c.json({ environment }, 201);
    });

    app.get("/environments/:envId/variables", (c) => {
        const envId = c.req.param("envId");
        const variables = db.query("SELECT * FROM environment_variables WHERE environment_id = ? ORDER BY created_at ASC").all(envId);
        return c.json({ variables });
    });

    app.post("/environments/:envId/variables", async (c) => {
        const envId = c.req.param("envId");
        const body = await c.req.json();
        if (!body.key || body.value === undefined) return c.json({ error: "Key and Value are required" }, 400);

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const isSecret = body.is_secret ? 1 : 0;
        
        db.query("INSERT INTO environment_variables (id, environment_id, key, value, is_secret, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, envId, body.key, body.value, isSecret, now, now);
        
        const variable = db.query("SELECT * FROM environment_variables WHERE id = ?").get(id);
        return c.json({ variable }, 201);
    });

    app.get("/projects/:projectId/export", (c) => {
        const projectId = c.req.param("projectId");
        const environments = db.query("SELECT * FROM environments WHERE project_id = ?").all(projectId) as any[];
        
        const exportData = environments.map((env) => {
            const variables = db.query("SELECT key, value, is_secret FROM environment_variables WHERE environment_id = ?").all(env.id);
            return {
                name: env.name,
                variables: variables
            };
        });
        
        return c.json({ export: exportData });
    });

    app.post("/projects/:projectId/import", async (c) => {
        const projectId = c.req.param("projectId");
        const body = await c.req.json();
        const importedEnvs = body.environments || [];
        
        const now = new Date().toISOString();
        
        for (const envData of importedEnvs) {
            const envId = crypto.randomUUID();
            db.query("INSERT INTO environments (id, project_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(envId, projectId, envData.name || "Imported Env", now, now);
            
            if (envData.variables && Array.isArray(envData.variables)) {
                for (const v of envData.variables) {
                    const varId = crypto.randomUUID();
                    const isSecret = v.is_secret ? 1 : 0;
                    db.query("INSERT INTO environment_variables (id, environment_id, key, value, is_secret, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(varId, envId, v.key, v.value || "", isSecret, now, now);
                }
            }
        }
        
        return c.json({ success: true }, 201);
    });

    app.post("/proxy", async (c) => {
        const body = await c.req.json();
        const { method = "GET", url, headers = {}, requestBody } = body;
        
        if (!url) return c.json({ error: "URL is required" }, 400);

        const start = Date.now();
        let resStatus = 0;
        let resHeaders = "";
        let resBody = "";
        let success = 0;
        let errCode = "";
        let errMsg = "";
        
        const reqHeadersJson = JSON.stringify(headers);
        const reqBodyText = requestBody || "";
        
        try {
            const options: RequestInit = { method, headers };
            if (["POST", "PUT", "PATCH"].includes(method)) {
                options.body = requestBody;
            }
            
            const targetUrl = url.startsWith('http') ? url : `https://${url}`;
            const fetchRes = await fetch(targetUrl, options);
            
            resStatus = fetchRes.status;
            const resHeadersObj: Record<string, string> = {};
            fetchRes.headers.forEach((v, k) => { resHeadersObj[k] = v; });
            resHeaders = JSON.stringify(resHeadersObj);
            
            resBody = await fetchRes.text();
            success = fetchRes.ok ? 1 : 0;
            
        } catch (err: any) {
            errCode = err.name || "Error";
            errMsg = err.message;
            success = 0;
        }

        const duration = Date.now() - start;
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        db.query(`
            INSERT INTO request_runs (
                id, method, url, request_headers_json, request_body_text,
                response_status, response_headers_json, response_body_text,
                duration_ms, success, error_code, error_message, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, method, url, reqHeadersJson, reqBodyText, 
            resStatus, resHeaders, resBody, 
            duration, success, errCode, errMsg, now
        );

        return c.json({
            id,
            status: resStatus,
            headers: resHeaders ? JSON.parse(resHeaders) : {},
            data: resBody,
            time: duration,
            error: errMsg ? errMsg : null,
        });
    });

    app.get("/history", (c) => {
        const runs = db.query("SELECT * FROM request_runs ORDER BY created_at DESC LIMIT 50").all();
        const parsedRuns = runs.map((r: any) => ({
            ...r,
            request_headers: r.request_headers_json ? JSON.parse(r.request_headers_json) : {},
            response_headers: r.response_headers_json ? JSON.parse(r.response_headers_json) : {}
        }));
        return c.json({ history: parsedRuns });
    });

    return app;
}
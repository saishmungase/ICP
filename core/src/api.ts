import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { limit } from "./libs.js";
import DataManager from "./data-manager.js";

const app = express();
const dataManager = new DataManager();

app.use(cors());
app.use(rateLimit(limit));
app.use(express.json());

app.post("/score", async (req, res) => {
    const { domain, settings } = req.body;

    if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ error: 'domain is required' });
    }
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'settings is required' });
    }

    try {
        const result = await dataManager.score(domain, settings);
        return res.json(result);
    } catch (e) {
        console.error('[score] error:', e);
        return res.status(500).json({ error: 'Internal error' });
    }
});

app.post("/autocomplete", async (req, res) => {
    const { field, query, limit: lim } = req.body;

    if (!field) {
        return res.status(400).json({ error: 'field is required' });
    }

    try {
        const suggestions = await dataManager.autocomplete(field, query || '', lim || 15);
        console.log(`[autocomplete] field=${field} query="${query}" → ${suggestions.length} results`);
        return res.json(suggestions);
    } catch (e) {
        console.error('[autocomplete] error:', e);
        return res.status(500).json([]);
    }
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(3000, () => console.log("ICP Scout backend running at http://localhost:3000"));
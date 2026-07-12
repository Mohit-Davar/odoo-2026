import express from "express";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// All roles can access the AI assistant
const allRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

// Only Dispatchers can trigger the optimizer (trip assignment is their responsibility)
const dispatchRoles = ["Dispatcher"];

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

/**
 * Generic proxy helper — forwards the request body to the FastAPI AI service
 * and streams the JSON response back to the frontend caller.
 * @param {string} path - The FastAPI endpoint path (e.g. "/api/ai/chat")
 */
async function proxyToAI(path, req, res) {
    try {
        const response = await fetch(`${AI_SERVICE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.detail || "AI service returned an error.",
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error(`[AI Proxy] Error forwarding to ${path}:`, error.message);
        return res.status(503).json({
            error: "AI service is currently unavailable. Please try again later.",
        });
    }
}

// Apply auth middleware to all AI routes
router.use(verifyAccessToken);

/**
 * POST /api/ai/chat
 * Chat with the AI fleet assistant.
 * Accessible by all authenticated roles.
 * Body: { message: string, history: Array<{ role: string, content: string }> }
 */
router.post("/chat", requireRoles(allRoles), async (req, res) => {
    return proxyToAI("/api/ai/chat", req, res);
});

/**
 * POST /api/ai/optimize-dispatch
 * AI-powered dispatch optimizer — suggests best vehicle-driver pairings for pending trips.
 * Restricted to Dispatchers only.
 * Body: { trips: Array<{ id, origin, destination, cargoWeightKg, plannedDistanceKm }> }
 */
router.post("/optimize-dispatch", requireRoles(dispatchRoles), async (req, res) => {
    return proxyToAI("/api/ai/optimize-dispatch", req, res);
});

export default router;

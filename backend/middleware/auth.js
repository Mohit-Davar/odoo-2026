import jwt from "jsonwebtoken";
import { findUserById } from "../models/user.model.js";

export const verifyAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                msg: "Access TOKEN Missing"
            });
        }
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({
                msg: "Invalid or expired token"
            });
            req.user = decoded; // decoded will include id and email
            next();
        })
    } catch (error) {
        res.status(500).json({
            msg: "Authentication Failed"
        });
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Not authenticated" });
        }
        const user = await findUserById(req.user.id);

        if (user && user.roleId === 1) {
            next();
        } else {
            return res.status(403).json({ msg: "Access Denied: Admin only" });
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
}

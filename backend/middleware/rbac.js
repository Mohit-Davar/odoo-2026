import { pool } from "../config/db.js";
import { findUserById } from "../models/user.model.js";

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * It assumes `verifyAccessToken` has already run and populated `req.user`.
 * 
 * @param {string[]} allowedRoles Array of role names that are permitted to access the route
 */
export const requireRoles = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ msg: "Not authenticated" });
            }
            if (req.user.isInternal) {
                return next();
            }

            if (!req.user.id) {
                return res.status(401).json({ msg: "Not authenticated" });
            }

            // Fetch user to get their role_id
            const user = await findUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }
            // Fetch the role name from the database
            const { rows } = await pool.query(
                "SELECT UPPER(REPLACE(name, ' ', '_')) AS name FROM roles WHERE id = $1",
                [user.roleId]
            );
            if (rows.length === 0) {
                return res.status(403).json({ msg: "Role not found" });
            }
            const userRole = rows[0].name; // e.g. "FLEET_MANAGER", "DISPATCHER", "ADMIN"
            // Admin always has access Or only allowed roles
            if (userRole === "ADMIN" || allowedRoles.includes(userRole)) {
                // Attach role name to request for convenience
                req.user.roleName = userRole;
                next();
            } else {
                return res.status(403).json({ msg: `Access Denied: Requires one of [${allowedRoles.join(", ")}]` });
            }
        } catch (error) {
            console.error("RBAC Middleware Error:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    };
};

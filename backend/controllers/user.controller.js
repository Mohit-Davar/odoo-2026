import { findUserById } from "../models/user.model.js";

export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.id, { includePassword: false });
        if (!user) return res.status(404).json({
            msg: "User Not found"
        });
        delete user.refreshToken;
        res.json(user);
    } catch (error) {
        res.status(500).json({
            msg: "Something went wrong so"
        })
    }
}

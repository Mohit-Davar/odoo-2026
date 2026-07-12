import { findUserById } from "../models/user.model.js";

/**
 * @typedef {import('express').Request} GetProfileRequest
 * @typedef {import('express').Response} GetProfileResponse
 */

/**
 * Retrieves the profile of the currently authenticated user.
 * @param {GetProfileRequest} req The Express request object, containing the user's ID from authentication middleware.
 * @param {GetProfileResponse} res The Express response object.
 * @returns {Promise<void | GetProfileResponse>}
 */
export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.id, { includePassword: false });
        if (!user) return res.status(404).json({
            msg: "User Not found"
        });
        delete user.refreshToken;
        return res.json(user);
    } catch (error) {
        return res.status(500).json({
            msg: "Something went wrong so"
        })
    }
}

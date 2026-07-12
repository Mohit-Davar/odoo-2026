import bcrypt from "bcrypt";
import * as adminModel from "../models/admin.model.js";
import { findUserByEmail } from "../models/user.model.js";
import { addPersonSchema, assignRoleSchema } from "../schemas/admin.schema.js";

/**
 * @typedef {import('zod').infer<typeof addPersonSchema>} AddPersonBody
 * @typedef {import('express').Request<{}, {}, AddPersonBody>} AddPersonRequest
 * @typedef {import('express').Response} AddPersonResponse
 */

/**
 * Creates a new user account.
 * @param {AddPersonRequest} req - Express request containing new user details in the body.
 * @param {AddPersonResponse} res - Express response stream.
 * @returns {Promise<void | AddPersonResponse>} A JSON payload indicating success or failure.
 */
export const addPerson = async (req, res) => {
    const validation = addPersonSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { name, email, password, roleId } = validation.data;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await adminModel.addPerson({
            name,
            email,
            password: hashedPassword,
            roleId,
            verified: true
        });

        return res.status(201).json({
            msg: "Person added successfully",
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @typedef {import('zod').infer<typeof assignRoleSchema>} AssignRoleSchema
 * @typedef {import('express').Request<AssignRoleSchema['params'], {}, AssignRoleSchema['body']>} AssignRoleRequest
 * @typedef {import('express').Response} AssignRoleResponse
 */

/**
 * Assigns an operational security role to an existing system user.
 * @param {AssignRoleRequest} req - Express request holding path params (id) and request body (roleId).
 * @param {AssignRoleResponse} res - Express response stream emitter.
 * @returns {Promise<void | AssignRoleResponse>} Emits a JSON payload detailing operation status.
 */
export const assignRole = async (req, res) => {
    const validation = assignRoleSchema.safeParse({ body: req.body, params: req.params });
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { roleId } = validation.data.body;
    const { id } = validation.data.params;

    try {
        const updatedUser = await adminModel.assignRole(id, roleId);

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.status(200).json({
            msg: "Role assigned successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @typedef {import('express').Request} GetRolesRequest
 * @typedef {import('express').Response} GetRolesResponse
 */

/**
 * Retrieves a list of all available roles.
 * @param {GetRolesRequest} req The Express request object.
 * @param {GetRolesResponse} res The Express response object.
 * @returns {Promise<GetRolesResponse>}
 */
export const getRoles = async (req, res) => {
    try {
        const roles = await adminModel.getAllRoles();
        return res.status(200).json(roles);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @typedef {import('express').Request} GetUsersRequest
 * @typedef {import('express').Response} GetUsersResponse
 */

/**
 * Retrieves a list of all users.
 * @param {GetUsersRequest} req The Express request object.
 * @param {GetUsersResponse} res The Express response object.
 * @returns {Promise<GetUsersResponse>}
 */
export const getUsers = async (req, res) => {
    try {
        const users = await adminModel.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

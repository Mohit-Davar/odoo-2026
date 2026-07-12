import bcrypt from "bcrypt";
import * as adminModel from "../models/admin.model.js";
import { findUserByEmail } from "../models/user.model.js";

export const addPerson = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Name, email, and password are required" });
        }

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

        res.status(201).json({
            msg: "Person added successfully",
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const assignRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(400).json({ msg: "Role ID is required" });
        }

        const updatedUser = await adminModel.assignRole(id, roleId);

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({
            msg: "Role assigned successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await adminModel.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await adminModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

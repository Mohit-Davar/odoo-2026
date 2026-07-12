import { pool } from "../config/db.js";

// Helper to convert db row (snake_case) to JS object (camelCase)
function mapRowToUser(row) {
    if (!row) return null;
    const user = new User({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        refreshToken: row.refresh_token,
        verified: row.verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
    // Ensure both id and _id are defined
    user._id = row.id;
    return user;
}

class UserQuery {
    constructor(promise) {
        this.promise = promise;
    }
    then(resolve, reject) {
        return this.promise.then(resolve, reject);
    }
    async select(fieldsStr) {
        const user = await this.promise;
        if (!user) return null;
        const fields = fieldsStr.split(" ");
        fields.forEach(field => {
            if (field.startsWith("-")) {
                const prop = field.substring(1);
                delete user[prop];
                if (prop === "id") delete user._id;
                if (prop === "refreshToken") delete user.refreshToken;
            }
        });
        return user;
    }
}

export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this._id = data.id || null;
        this.name = data.name || null;
        this.email = data.email || null;
        this.password = data.password || null;
        this.refreshToken = data.refreshToken || null;
        this.verified = data.verified !== undefined ? data.verified : false;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    static async findOne(query) {
        if (query.email) {
            const res = await pool.query("SELECT * FROM users WHERE email = $1", [query.email]);
            return mapRowToUser(res.rows[0]);
        }
        if (query.refreshToken) {
            const res = await pool.query("SELECT * FROM users WHERE refresh_token = $1", [query.refreshToken]);
            return mapRowToUser(res.rows[0]);
        }
        return null;
    }

    static findById(id) {
        const promise = (async () => {
            const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
            return mapRowToUser(res.rows[0]);
        })();
        return new UserQuery(promise);
    }

    async save() {
        if (this.id) {
            // Update
            const res = await pool.query(
                `UPDATE users 
                 SET name = $1, email = $2, password = $3, refresh_token = $4, verified = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [
                    this.name,
                    this.email,
                    this.password,
                    this.refreshToken,
                    this.verified,
                    this.id
                ]
            );
            const updated = mapRowToUser(res.rows[0]);
            if (updated) {
                Object.assign(this, updated);
            }
            return this;
        } else {
            // Insert
            const res = await pool.query(
                `INSERT INTO users (name, email, password, refresh_token, verified)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [
                    this.name,
                    this.email,
                    this.password,
                    this.refreshToken,
                    this.verified
                ]
            );
            const inserted = mapRowToUser(res.rows[0]);
            if (inserted) {
                Object.assign(this, inserted);
            }
            return this;
        }
    }
}

export default User;
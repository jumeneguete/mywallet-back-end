import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from './database/database.js';
import schema from './schema/validationSchema.js'

export async function signup(req, res) {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    const validInput = schema.validate({ name, email, password });

    if (!validInput.error) {
        try {
            const existingEmail = await connection.query(`SELECT email FROM users WHERE email = $1`, [email]);

            if (existingEmail.rows.length === 0) {
                await connection.query(`
                    INSERT INTO users (name, email, password)
                    VALUES ($1, $2, $3)`, [name, email, hash]);

                return res.sendStatus(201);
            } else {
                return res.sendStatus(409);
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        return res.sendStatus(400);
    }
};


export async function signin (req, res) {
    const { email, password } = req.body;
    const validInput = schema.validate({ email, password });

    if (!validInput.error) {
        try {
            const result = await connection.query(`
                SELECT * FROM users WHERE email = $1
            `, [email]);

            const user = result.rows[0];

            if (user && bcrypt.compareSync(password, user.password)) {
                const token = uuid();
                const validToken = schema.validate({ token });
                if (validToken.error) return res.sendStatus(400);

                await connection.query(`INSERT INTO sessions ("idUser", token) VALUES ($1, $2)`, [user.id, token]);
                res.send(token);
            } else {
                res.sendStatus(401);
            }

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        return res.sendStatus(400);
    }

};


export async function logout (req, res) {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);
    try {
        const existingToken = await connection.query(`SELECT token from sessions where token = $1`, [token])
        if (existingToken.rows.length === 0) return res.sendStatus(404);
        await connection.query(`DELETE FROM sessions WHERE token = $1`, [token]);
        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from './database/database.js';
import dayjs from 'dayjs';
import joi from 'joi';

const app = express();
app.use(cors());
app.use(express.json());


const schema = joi.object({
    name: joi.string().min(3).replace(" ", ""),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().min(1).replace(" ", ""),
    positiveValue: joi.number().positive().integer(),
    negativeValue: joi.number().negative().integer(),
    description: joi.string(),
    date: joi.date().iso(),
    token: joi.string().min(10)
}).unknown(true);

app.post("/signup", async (req, res) => {
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
});

app.post("/", async (req, res) => {
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

});

app.get("/home", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    try {
        const result = await connection.query(`
        SELECT r.*
        FROM registers r
        JOIN sessions s
        ON s."idUser" = r."idUser"
        WHERE s.token = $1
        `, [token]);

        const user = await connection.query(`SELECT id, name, email FROM users WHERE id = $1`, [result.rows[0].idUser]);

        const userAndRegisters = [{
            user: {
                idUser: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                token: result.rows[0].token
            },
            registers: result.rows
        }]

        userAndRegisters[0].registers.map(r => {
            delete r.token;
        })

        res.send(userAndRegisters);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get("/register/:id", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { id } = req.params;

    if (!token) return res.sendStatus(401);

    try {
        const existingRegister = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
        if (existingRegister.rows.length === 0) {
            return res.sendStatus(404);
        }

        res.send(existingRegister.rows);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/cashin", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ positiveValue: value, description, date, token });

    if (!validInput.error) {
        try {
            const result = await connection.query(`SELECT "idUser" FROM sessions WHERE token = $1`, [token]);

            const id = result.rows[0].idUser

            const cashin = await connection.query(`
            INSERT INTO registers
            ("idUser", value, description, date, cashin, cashout) 
            VALUES ($1, $2, $3, $4, true, false)
            `, [id, value, description, date])

            res.sendStatus(201);

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

    } else {
        return res.sendStatus(400);
    }
});

app.post("/updatecashin/:id", async (req, res) => {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const { id } = req.params;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ positiveValue: value, description, date, token });
    console.log(validInput)

    if (!validInput.error) {
        try {
            const existingRegister = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
            if (existingRegister.rows.length === 0) {
                return res.sendStatus(404);
            }

            await connection.query(`
            UPDATE registers
            SET value = $1, description = $2, date = $3
            WHERE id = $4
            `, [value, description, date, id])

            res.sendStatus(201);

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

    } else {
        return res.sendStatus(400);
    }
});

app.post("/cashout", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ negativeValue: value, description, date, token });

    if (!validInput.error) {
        try {
            const result = await connection.query(`SELECT "idUser" FROM sessions WHERE token = $1`, [token]);

            const id = result.rows[0].idUser

            const cashin = await connection.query(`
            INSERT INTO registers
            ("idUser", value, description, date, cashin, cashout) 
            VALUES ($1, $2, $3, $4, false, true)
            `, [id, value, description, date])

            res.sendStatus(201);

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

    } else {
        return res.sendStatus(400);
    }
});

app.post("/updatecashout/:id", async (req, res) => {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const { id } = req.params;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ negativeValue: value, description, date, token });
    console.log(validInput)

    if (!validInput.error) {
        try {
            const existingRegister = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
            if (existingRegister.rows.length === 0) {
                return res.sendStatus(404);
            }

            await connection.query(`
            UPDATE registers
            SET value = $1, description = $2, date = $3
            WHERE id = $4
            `, [value, description, date, id])

            res.sendStatus(201);

        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }

    } else {
        return res.sendStatus(400);
    }
});


app.delete('/delete/:id', async (req, res) => {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { id } = req.params;

    if (!token) return res.sendStatus(401);


    try {
        const existingRegister = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
        if (existingRegister.rows.length === 0) {
            return res.sendStatus(404);
        }

        await connection.query('DELETE FROM registers WHERE id = $1', [id])
        res.sendStatus(200)

    } catch (err) {
        console.log(err);
        res.sendStatus(500);

    }
});


app.post("/logout", async (req, res) => {
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
})

export default app;
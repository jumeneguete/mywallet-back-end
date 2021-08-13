import connection from './database/database.js';
import dayjs from 'dayjs';
import schema from './schema/validationSchema.js'

export function getRegisters(req, res) {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    try {
        const result = await connection.query(`
        SELECT r.*, s."idUser"
        FROM registers r
        JOIN sessions s
        ON s."idUser" = r."idUser"
        WHERE s.token = $1
        `, [token]);

        const resultUser = await connection.query(`SELECT "idUser" FROM sessions WHERE token = $1`, [token]);

        const user = await connection.query(`SELECT id, name, email FROM users WHERE id = $1`, [resultUser.rows[0].idUser]);

        const userAndRegisters = [{
            user: {
                idUser: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                token: resultUser.rows[0].token
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
};

export async function getRegisterById (req, res) {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { id } = req.params;

    if (!token) return res.sendStatus(401);

    try {
        const existingRegister = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
        if (existingRegister.rows.length === 0) {
            return res.sendStatus(404);
        }

        res.send(existingRegister.rows[0]);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function addIncome (req, res) {

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
};

export async function updateIncome (req, res) {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const { id } = req.params;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ positiveValue: value, description, date, token });

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
};

export async function addOutcome (req, res) {

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
};

export async function updateOutcome(req, res) {
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    const { value, description } = req.body;
    const { id } = req.params;
    const date = dayjs().format("YYYY-MM-DD");

    if (!token) return res.sendStatus(401);

    const validInput = schema.validate({ negativeValue: value, description, date, token });

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
};

export async function deleteRegister (req, res) {
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
};
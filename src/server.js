import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from './database/database.js';
import dayjs from 'dayjs';

const app = express();
app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    try {
        await connection.query(`
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)`, [name, email, hash]);

        res.sendStatus(201);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await connection.query(`
            SELECT * FROM users WHERE email = $1
        `, [email]);

        const user = result.rows[0];

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();

            await connection.query(`INSERT INTO sessions ("idUser", token) VALUES ($1, $2)`, [user.id, token])
            res.send(token);
        } else {
            res.sendStatus(401);
        }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get("/home", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);


    try {
        const result = await connection.query(`
        SELECT *
        FROM registers r
        JOIN sessions s
        ON s."idUser" = r."idUser"
        WHERE s.token = $1
        `, [token]);

        const user = await connection.query(`SELECT id, name, email FROM users WHERE id = $1`, [result.rows[0].idUser]);

        const userAndRegisters = {
            user: {
                idUser: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            },
            registers: result.rows
        }

        res.send(userAndRegisters);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/cashin", async (req, res) => {

    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    const date = dayjs();

    try{
        const { value, description } = req.body;

        const result = await connection.query(`SELECT "idUser" FROM sessions WHERE token = $1`, [token]);

        const id = result.rows[0].idUser

        const cashin = await connection.query(`
        INSERT INTO registers
        ("idUser", value, description, date, cashin, cashout) 
        VALUES ($1, $2, $3, $4, true, false)
        `, [id,value, description, date ])

        res.sendStatus(201);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log('Server is listening on port 4000.')
})
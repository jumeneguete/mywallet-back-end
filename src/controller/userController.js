import {schema} from '../schema/validationSchema.js';
import * as userService from "../service/userService.js";

export async function signup(req, res) {
    const { name, email, password } = req.body;
    const validInput = schema.validate({ name, email, password });

    if (validInput.error) return res.sendStatus(400);

    try {
        const result = await userService.insertNewUser(name, email, password);
        if (!result) return res.sendStatus(409);
        return res.sendStatus(201);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

};

export async function signin(req, res) {
    const { email, password } = req.body;
    const validInput = schema.validate({ email, password });

    if (validInput.error) return res.sendStatus(400);

    try {
        const result = await userService.signin(email, password);
        if(result === null) return res.sendStatus(401);
        if(result === false) return res.sendStatus(400);

        res.send(result);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

export async function logout(req, res) {
        const result = await userService.logout(res.locals.userId);
        if (!result) return res.sendStatus(404);
        res.sendStatus(200);
};

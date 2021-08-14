import * as userService from "../service/userService.js";
import { schema } from "../schema/validationSchema.js";

export async function authMiddleware(req, res, next){
    const authorization = req.header("authorization");
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    const validToken = schema.validate({ token });
    if (validToken.error) return res.sendStatus(400);

    const userId = await userService.authentication(token);
    if (!userId) return res.sendStatus(401);

    res.locals.userId = userId;
    next();
}
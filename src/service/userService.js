import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { schema } from '../schema/validationSchema.js';
import * as userRepository from "../repository/userRepository.js";

export async function insertNewUser(name, email, password) {
    const hash = bcrypt.hashSync(password, 10);

    const existingEmail = await userRepository.findOneUserByEmail(email);
    if (existingEmail.length === 0) {
        await userRepository.insertNewUser(name, email, hash);
        return true;
    } else {
        return false;
    }
};

export async function signin(email, password) {
    const user = await userRepository.findOneUserByEmail(email);

    if (user.length === 0 && !bcrypt.compareSync(password, user[0].password)) return null;

    const token = uuid();
    const validToken = schema.validate({ token });
    if (validToken.error) return false;

    await userRepository.createNewSession(user[0].id, token);
    return token;
};

export async function logout(idUser) {
    const existingUser = await userRepository.findSessionByUserId(idUser)

    if (existingUser.rows.length === 0) return false;
    await userRepository.deleteSession(idUser);
    return true;
};

export async function authentication(token){
    const session = await userRepository.findByToken(token);
    if (session.rows.length === 0) return null;
    return session.rows[0].idUser;
}
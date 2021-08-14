import connection from '../database/database.js';

export async function insertNewUser(name, email, hash) {
    await connection.query(`
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)`, [name, email, hash]);
    return true;
};

export async function findOneUserByEmail(email) {
    const result = await connection.query(`
    SELECT * FROM users WHERE email = $1
    `, [email]);
    return result.rows;
};

export async function createNewSession(id, token) {
    await connection.query(`
        INSERT INTO sessions ("idUser", token) 
        VALUES ($1, $2)`, 
        [id, token]);
};

export async function findSessionByUserId(idUser) {
    const existingUser = await connection.query(`
                        SELECT * from users 
                        where "id" = $1`, 
                        [idUser]);
    return existingUser;
};

export async function findByToken(token) {
    const existingToken = await connection.query(`
                        SELECT * from sessions 
                        where token = $1`, 
                        [token]);
    return existingToken;
};

export async function deleteSession(idUser) {
    await connection.query(`DELETE FROM sessions 
            WHERE "idUser" = $1`, 
            [idUser]);
};
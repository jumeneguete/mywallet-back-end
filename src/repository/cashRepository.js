import connection from '../database/database.js';

export async function findRegistersByUserId(idUser) {
    const result = await connection.query(`SELECT * FROM registers WHERE "idUser" = $1`, [idUser]);
    return result;
};

export async function findUserIdByToken(token) {
    const IdUser = await connection.query(`SELECT "idUser" FROM sessions WHERE token = $1`, [token]);
   
   return IdUser;
};

export async function findTokenByUserId(idUser) {
    const token = await connection.query(`SELECT token FROM sessions WHERE "idUser" = $1`, [idUser]);
   
   return token;
};

export async function findOneUserById(id) {
    const user = await connection.query(`SELECT id, name, email FROM users WHERE id = $1`, [id]);
    return user;
};

export async function findRegistersById(id) {
    const user = await connection.query(`SELECT * FROM registers WHERE id = $1`, [id]);
    return user;
};

export async function insertIncome(id, value, description, date) {
    await connection.query(`
            INSERT INTO registers
            ("idUser", value, description, date, cashin, cashout) 
            VALUES ($1, $2, $3, $4, true, false)
            `, [id, value, description, date])
};

export async function insertOutcome(id, value, description, date) {
    await connection.query(`
            INSERT INTO registers
            ("idUser", value, description, date, cashin, cashout) 
            VALUES ($1, $2, $3, $4, false, true)
            `, [id, value, description, date])
};

export async function updateRegister(value, description, date, id) {
    await connection.query(`
            UPDATE registers
            SET value = $1, description = $2, date = $3
            WHERE id = $4
            `, [value, description, date, id])
};

export async function deleteRegister(id) {
    await connection.query('DELETE FROM registers WHERE id = $1', [id])
};
import dayjs from 'dayjs';
import * as cashRepository from "../repository/cashRepository.js";

export async function getUserAndRegisters(idUser) {
    const allRegisters = await cashRepository.findRegistersByUserId(idUser);
    const token = await cashRepository.findTokenByUserId(idUser);
    const user = await cashRepository.findOneUserById(idUser);

    const userAndRegisters = [{
        user: {
            idUser,
            name: user.rows[0].name,
            email: user.rows[0].email,
            token: token.rows[0].token
        },
        registers: allRegisters.rows
    }]

    userAndRegisters[0].registers.map(r => {
        delete r.token;
    })

    return userAndRegisters;

};

export async function getRegisterById(id) {
    const existingRegister = await cashRepository.findRegistersById(id);
    if (existingRegister.rows.length === 0) return false;

    return (existingRegister.rows[0]);

};

export async function addIncome(value, description, idUser) {
    const date = dayjs().format("YYYY-MM-DD");
    await cashRepository.insertIncome(idUser, value, description, date);
};

export async function addOutcome(value, description, idUser) {
    const date = dayjs().format("YYYY-MM-DD");
    await cashRepository.insertOutcome(idUser, value, description, date);
};

export async function updateRegister(value, description, id) {
    const date = dayjs().format("YYYY-MM-DD");

    const existingRegister = await cashRepository.findRegistersById(id);
    if (existingRegister.rows.length === 0) return false;

    if (existingRegister.rows[0].value < 0 && value < 0) {
        await cashRepository.updateRegister(value, description, date, id);
        return true;
    }

    if (existingRegister.rows[0].value > 0 && value > 0) {
        await cashRepository.updateRegister(value, description, date, id);
        return true;
    }
    return false;
};

export async function deleteRegister(id) {
    const existingRegister = await cashRepository.findRegistersById(id);
    if (existingRegister.rows.length === 0) return false;

    await cashRepository.deleteRegister(id)
    return true;

};
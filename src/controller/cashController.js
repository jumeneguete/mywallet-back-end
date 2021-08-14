import { schema } from '../schema/validationSchema.js';
import * as cashService from "../service/cashService.js";

export async function getRegisters(req, res) {
    const userAndRegisters = await cashService.getUserAndRegisters(res.locals.userId);
    res.send(userAndRegisters);
};

export async function getRegisterById(req, res) {
    const { id } = req.params;

    const result = await cashService.getRegisterById(id);
    if (!result) return res.sendStatus(404);
    res.send(result);
};

export async function addIncome(req, res) {
    const { value, description } = req.body;

    const validInput = schema.validate({ positiveValue: value, description });
    if (validInput.error) return res.sendStatus(400);

    await cashService.addIncome(value, description, res.locals.userId);
    res.sendStatus(201);
};

export async function updateIncome(req, res) {
    const { value, description } = req.body;
    const { id } = req.params;

    const validInput = schema.validate({ positiveValue: value, description });
    if (validInput.error) return res.sendStatus(400);

    const result = await cashService.updateRegister(value, description, id);
    if (!result) return res.sendStatus(400);
    return res.sendStatus(201);
};

export async function addOutcome(req, res) {
    const { value, description } = req.body;

    const validInput = schema.validate({ negativeValue: value, description });
    if (validInput.error) return res.sendStatus(400);

    await cashService.addOutcome(value, description, res.locals.userId);
    res.sendStatus(201);
};

export async function updateOutcome(req, res) {
    const { value, description } = req.body;
    const { id } = req.params;

    const validInput = schema.validate({ negativeValue: value, description });
    if (validInput.error) return res.sendStatus(400);

    const result = await cashService.updateRegister(value, description, id);
    if (!result) return res.sendStatus(400);
    return res.sendStatus(201);
};

export async function deleteRegister(req, res) {
    const { id } = req.params;

    await cashService.deleteRegister(id);
    res.sendStatus(200);
};
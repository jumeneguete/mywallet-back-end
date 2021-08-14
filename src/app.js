import express from 'express';
import cors from 'cors';
import * as userController from "./controller/userController.js";
import * as cashController from "./controller/cashController.js";
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());


app.post("/signup", userController.signup);
app.post("/signin", userController.signin);
app.post("/logout", authMiddleware, userController.logout);
app.get("/register", authMiddleware, cashController.getRegisters);
app.get("/register/:id", authMiddleware, cashController.getRegisterById);
app.post("/cashin", authMiddleware, cashController.addIncome);
app.post("/updatecashin/:id", authMiddleware, cashController.updateIncome);
app.post("/cashout", authMiddleware, cashController.addOutcome);
app.post("/updatecashout/:id", authMiddleware, cashController.updateOutcome);
app.delete('/delete/:id', authMiddleware, cashController.deleteRegister);

app.use((err, req, res, next) => {
    console.log(err)
    res.sendStatus(500);
  });

export default app;
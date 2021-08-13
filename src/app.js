import express from 'express';
import cors from 'cors';
import * as userController from "./controller/userController.js";
import * as cashController from "./controller/cashController.js";

const app = express();
app.use(cors());
app.use(express.json());


app.post("/signup", userController.signup);
app.post("/signin", userController.signin);
app.post("/logout", userController.logout);
app.post("/home", cashController.getRegisters);
app.get("/register/:id", cashController.getRegisterById);
app.post("/cashin", cashController.addIncome);
app.post("/updatecashin/:id", cashController.updateIncome);
app.post("/cashout", cashController.addOutcome);
app.post("/updatecashout/:id", cashController.updateOutcome);
app.delete('/delete/:id', cashController.deleteRegister);


export default app;
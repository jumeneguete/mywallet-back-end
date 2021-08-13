import supertest from "supertest";
import app from "../src/app.js"
import connection from "../src/database/database.js";

beforeEach(async ()=> {
    await connection.query('DELETE FROM users')
});

afterAll(()=> connection.end());

describe("POST /signup", () => {
    it("returns status 201 for valid values received via body", async () => {
        const body = { name: 'Test', email: 'email@email.com', password: 'test'};
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(201);
    });

    it("returns status 400 for invalid values received via body", async () => {
        const body = { name: 'Test', email: 'notValid', password: 'test'};
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid values received via body", async () => {
        const body = { name: '    ', email: 'a@a.com', password: 'test'};
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 409 for an already existing email received via body", async () => {
        const body = { name: 'Test', email: 'b@b.com', password: 'test'};
        await supertest(app).post("/signup").send(body);
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(409);
    });
});

describe("POST /", ()=>{
    it("returns token (string) for valid values received via body", async () => {
        const body = { email: 'c@c.com', password: 'test'};
        await supertest(app).post("/signup").send(body);
        const result = await supertest(app).post("/").send(body);
        expect(result.text).toEqual(expect.any(String));
    });

    it("returns status 400 for invalid values received via body", async () => {
        const body = { email: 'd@d.com', password: '            '};
        const result = await supertest(app).post("/").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 401 for unexisting data in DB received via body", async () => {
        const body = { email: 'e@e.com', password: 'test'};
        const result = await supertest(app).post("/").send(body);
        expect(result.status).toEqual(401);
    });
});
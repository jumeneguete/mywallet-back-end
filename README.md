<h1 align="center">💰 MyWallet</h1>

MyWallet is an application that came to help their users to keep tracking their incomes and outcomes!! It is a digital Wallet! <br/>
In this application users can add their incomes and outcomes with a brief description and check their total amount left in real time!
It is an easy and simple way to organise finances with no stress!

<p align="center"><img width="400px" src="/assets/my_wallet.gif" /></p>


You can find this front-end application at https://github.com/jumeneguete/mywallet-front-end

### 🔹🔹About

This is an web application where people can add their incomes and expenses and keep it on track. Below are the implemented features:

- Sign Up ***(/signup)***;
- Sign In ***(/signin)***;

  Authenticated routes: 
- Get all existent income or outcome registers ***(/registers)***;
- Get an specific income or outcome register ***(/registers/:id)***;
- Add new income ***(/cashin)***;
- Edit an specific registered income ***(/updatecashin/:id)***;
- Add new outcome ***(/cashout)***;
- Edit an specific registered outcome ***(/updatecashout/:id)***;
- Delete a register ***(/delete/:id)***;
- Logout ***(/logout)***;


### 🔹🔹Technologies
- NodeJS
- Express
- PostgreSQL
- Jest
- Supertest
- <a href="https://www.npmjs.com/package/bcrypt" target="_blank">Bcrypt</a>
- <a href="https://www.npmjs.com/package/uuid" target="_blank">uuid</a>
- <a href="https://www.npmjs.com/package/dayjs" target="_blank">Dayjs</a>
- <a href="https://www.npmjs.com/package/joi" target="_blank">Joi</a>
- Front-end using ReactJS at https://github.com/jumeneguete/mywallet-front-end

### 🔹🔹Disclaimer

On this project I was training NodeJS, Express and database PostgresSQL without any appliance of clean architecture and it was my first time trainning integration tests. <br>
Later on I appplied some clean arquitecture fetures using controllers, services and repositories, and also using middleware to the authenticated routes. <br>
→ Soon I intend to implement integration tests to all routes.

### 🔹🔹How to run

1. Clone this repository
2. Ypu can clone the front-end repository an follow its instruction for installation at https://github.com/jumeneguete/mywallet-front-end
3. Install dependencies
```bash
npm i
```
4. Ceate an .env file based on env.example
5. The database required to run the application can be found at assets/dump.sql;
6. Run server
```bash
npm run dev
```
7. Congrats! App is runnig and you can test it using some API Client or together with the <a href="https://github.com/jumeneguete/mywallet-front-end" target="_blank">front-end application</a>.

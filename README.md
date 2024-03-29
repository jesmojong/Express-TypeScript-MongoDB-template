# Express-TypeScript-template

## Needed programs
**For production:** The best way to run this server in production is to install Docker and build the containers. <br>
**For development:**
Before you can boot up the server and run everything you'll first need to download a few programs that are needed for the server to work properly.

- The first one is `Node`. The server is a **Node** server and needs it to be able to run. 
  **Node** can be installed via [this](https://nodejs.org/en/download/) link.
  Download the **LTS** version, this one is the most stable and follow the steps necessary to complete the installation.

- Next up is MongoDB. The database used togehter with the server is MongoDB.
  You are able to install MongoDB from [this](https://www.mongodb.com/try/download/community) link.
  Download the **'MongoDB Community Server'** and follow the steps necessary to complete the installation.

## Preparing to run the environments
Before you are able to run the development or testing environment you need to set up **two** files.
These files will contain variables that are used by the server to connect with the database and to boot up the server at a specific port on your machine.
To do this create a **'.env'** file in the root directory where this README.md file is located. Inside this file you need to add the following variables:

- PORT={ **PORT NUMBER THAT YOU WANT TO USE FOR THE SERVER. GENERALY THIS IS: 8080** }
- DATABASE_URL={ **DATABASE CONNECTION URL. MOST OF THE TIME IT IS: mongodb://localhost:27017/** }
- DATABASE_NAME={ **NAME OF THE DATABASE THAT WILL BE CREATED e.g. Sneakers-Database** }
- DATABASE_CONNECTION_TIMEOUT={ **The amount of time in miliseconds where the server has to be connected to the database before a timeout error will be thrown, e.g. 10000 (10 seconds)** }
- JWT_SECRET={ **Secret used for the authentication tokens** }
- ACCESS_TOKEN_EXPIRATION={ **Expiration time in seconds used for the access tokens** }
- REFRESH_TOKEN_EXPIRATION={ **Expiration time in seconds used for the refresh tokens** }
- ID_TYPE={ **The type of ID's that are used in the database, it can be ObjectID or UUID** }

After the first file '.env' is setup repeat the same steps but with another file **'.test.env'**.
This file is used by the tests so the different tests won't intervene with the database you use for developing.
Make sure that the variable in this file **'DATABASE_NAME'** is **not** the same as the one in your **'.env'** file. 
The same goes for **'PORT'**. That one could be set to 8081 if the one in the other .env file is 8080.

## Running development environment
To run the development environment you need to have installed the dependencies in the above head.
After that you need to run the command `npm run dev` in the same folder as the **`'package.json'`**.
This will boot up the node server together with the **Nodemon**.

Nodemon is used to enable live-reloading. When you change a file in the server structure, Nodemon will reboot the server so you can directly see the made changes.

## Running the testing environment
To run all the tests that have been created for the project there is a single command. `npm run test`.
The command should be run in the same folder as the **`'package.json'`**. This will run the **Jest** testing module which will search for all `'.test.ts'` files within the `'/tests'` folder.
The output the command gives shows which tests have failed and which tests have successfully been run.

## Run with docker-compose
**Ensure that docker and docker-compose is installed on the host system!**

1. Ensure, that the `.env` is created followed the given structure. This is absolutely necessary, otherwise errors may occur during execution.
2. Run `docker-compose up --build` where the `docker-compose.yaml` and `.env` is located.
3. Now the composed services are booted up and the api should be accessible on `http://localhost:8080`. `docker ps` will give more infos about the containers.
4. Shutdown all created services use `docker-compose stop` or delete all created containers with `docker-compose down`
CREATE DATABASE taskdb;

\c taskdb;

CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50)
);

CREATE TABLE "Tasks" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    deadline TIMESTAMP,
    assigned_user INT REFERENCES "Users"(id)
);

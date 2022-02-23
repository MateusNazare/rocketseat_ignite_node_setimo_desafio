import request from "supertest";

import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const userResponse = await request(app).post("/api/v1/users").send({
      name: "Test name",
      email: "test@test.com.br",
      password: "admin",
    });

    expect(userResponse.status).toBe(201);
  });

  it("should not be able to create an user with existing name", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test name",
      email: "test@test.com.br",
      password: "admin",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "Test name two",
      email: "test@test.com.br",
      password: "admin",
    });

    expect(response.status).toBe(400);
  });
});

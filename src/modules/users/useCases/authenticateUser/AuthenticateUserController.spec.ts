import request from "supertest";

import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { AppError } from "../../../../shared/errors/AppError";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Test name",
      email: "test@test.com.br",
      password: "admin",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should not be able to authenticate an user with incorrect credentials", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@tests.com.br",
      password: "admin",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

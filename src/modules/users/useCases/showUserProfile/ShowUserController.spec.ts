import request from "supertest";

import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
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

  it("should be able to show an user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show an inexistent user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "testErr@test.com.br",
      password: "admin",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

import request from "supertest";

import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("should be able to create a new statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "salary",
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a new statement withdraw without money", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 2000,
        description: "bill",
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should not be able to create a new statement of an inexistent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "salary",
      })
      .set({
        Authorization: `Bearer Err`,
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

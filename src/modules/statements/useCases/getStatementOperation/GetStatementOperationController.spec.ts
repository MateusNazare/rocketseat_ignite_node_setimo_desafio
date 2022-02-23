import request from "supertest";

import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get a statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "salary",
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/" + responseStatement.body.id)
      .set({
        Authorization: `Bearer ${responseToken.body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to get statement operation of an inexistent user", async () => {
    const response = await request(app)
      .get("/api/v1/statements/" + "err")
      .set({
        Authorization: `Bearer err`,
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("should not be able to get a non-existent statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const response = await request(app)
      .get("/api/v1/statements/" + responseToken.body.user.id)
      .set({
        Authorization: `Bearer ${responseToken.body.token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

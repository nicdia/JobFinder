import request from "supertest";
import app from "../app";
import pool from "../utils/db";

let token: string;
let userId: number;
let testEmail: string;
const testPassword = "aa";

describe("🚀 API Endpoints", () => {
  beforeAll(() => {
    const timestamp = Date.now();
    // testEmail = `testuser_${timestamp}@example.com`;
    testEmail = `aa`;
  });

  it("✅ /register – should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    userId = res.body.id;
  });

  it("❌ /register – should fail with duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/bereits registriert/i);
  });

  it("✅ /login – should login successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("❌ /login – should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/ungültig/i);
  });

  it("✅ /userInputGeometry – should accept a Polygon", async () => {
    const res = await request(app)
      .post(`/api/userInputGeometry/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [9.8, 53.4],
              [10.3, 53.4],
              [10.3, 53.7],
              [9.8, 53.7],
              [9.8, 53.4],
            ],
          ],
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/gespeichert/i);
  });

  it("✅ /userInputGeometry – should accept a Point and call OTP", async () => {
    const coordinates: [number, number] = [53.55, 9.99];
    const queryParams = new URLSearchParams({
      algorithm: "accSampling",
      fromPlace: `${coordinates[1]},${coordinates[0]}`, // lat,lon
      mode: "WALK",
      walkSpeed: "1.4",
      date: "2025-04-14",
      time: "10:00:00",
      precisionMeters: "10",
      cutoffSec: "300",
    });

    const otpUrl = `http://localhost:8080/otp/routers/default/isochrone?${queryParams.toString()}`;
    console.log("🌐 Erwartete OTP-URL:", otpUrl);

    const res = await request(app)
      .post(`/api/userInputGeometry/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        geometry: {
          type: "Point",
          coordinates,
        },
        cutoff: 300,
        mode: "WALK",
        speed: 1.4,
        date: "2025-04-14",
        time: "10:00:00",
        label: "Test Isochrone",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Isochrone|gespeichert/i);
  });

  // Neuer Test: LineString durch das Zentrum von Hamburg
  it("✅ /userInputGeometry – should accept a LineString and convert it to Points", async () => {
    const res = await request(app)
      .post(`/api/userInputGeometry/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        geometry: {
          type: "LineString",
          coordinates: [
            [53.55, 9.99], // Punkt am Süden Hamburgs
            [53.65, 10.0], // Punkt am Norden von Hamburg
          ],
        },
        cutoff: 300,
        mode: "WALK",
        speed: 1.4,
        date: "2025-04-14",
        time: "10:00:00",
        label: "Test Isochrone",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Punkte verarbeitet/i);
  });
});
// 🔄 Nutzer aktualisieren
it("✅ /users/:userId – should update the user", async () => {
  const res = await request(app)
    .patch(`/api/users/${userId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      email: `${testEmail.replace("@", "+updated@")}`, // Beispieländerung
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/aktualisiert/i);
});

// 🗑️ Nutzer löschen
it("✅ /users/:userId – should delete the user", async () => {
  const res = await request(app)
    .delete(`/api/users/${userId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/gelöscht/i);
});

afterAll(async () => {
  await pool.end(); // 🔌 DB sauber schließen
});

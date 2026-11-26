const assert = require("node:assert/strict");
const http = require("node:http");
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

process.env.SESSION_SECRET = "native-refresh-access-test-secret";
process.env.NATIVE_REFRESH_TOKEN_SECRET = "native-refresh-hash-test-secret";

const router = require("../src/router").default;
const UserModel = require("../src/schema/User.model").default;
const NativeRefreshSessionModel = require("../src/schema/NativeRefreshSession.model").default;
const NativeAuthService = require("../src/models/NativeAuth.service").default;
const { UserStatus, UserType } = require("../src/libs/enums/user.enum");

const nativeAuthService = new NativeAuthService();

mongoose.set("strictQuery", false);

const closeServer = (server) => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
});

const postJson = async (baseUrl, path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    setCookie: response.headers.get("set-cookie"),
    body: await response.json(),
  };
};

const run = async () => {
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  let server;

  try {
    await mongoose.connect(replSet.getUri());
    const password = await bcrypt.hash("correct-password", 10);
    await UserModel.create({
      userType: UserType.BUYER,
      userStatus: UserStatus.ACTIVE,
      userNick: "native-refresh-buyer",
      userEmail: "native-refresh-buyer@example.com",
      userPhone: "010-0000-0000",
      userPassword: password,
    });

    const app = express();
    app.use(express.json());
    app.use(router);
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const login = await postJson(baseUrl, "/auth/native/login", {
      userNick: "native-refresh-buyer",
      userPassword: "correct-password",
      deviceId: "native-refresh-device",
      deviceLabel: "Integration test device",
    });

    assert.equal(login.status, 200);
    assert.equal(login.setCookie, null);
    assert.equal(login.body.user.userPassword, undefined);
    assert.equal(login.body.user.authVersion, undefined);
    assert.ok(login.body.accessToken);
    assert.ok(login.body.refreshToken);

    const oldHash = nativeAuthService.hashRefreshToken(login.body.refreshToken);
    const refresh = await postJson(baseUrl, "/auth/native/refresh", {
      refreshToken: login.body.refreshToken,
    });

    assert.equal(refresh.status, 200);
    assert.equal(refresh.setCookie, null);
    assert.notEqual(refresh.body.refreshToken, login.body.refreshToken);
    assert.equal(JSON.stringify(refresh.body).includes(login.body.refreshToken), false);
    assert.equal(refresh.body.user.userPassword, undefined);
    assert.equal(refresh.body.user.authVersion, undefined);

    const oldSession = await NativeRefreshSessionModel
      .findOne({ tokenHash: oldHash })
      .select("+tokenHash")
      .lean()
      .exec();
    const newHash = nativeAuthService.hashRefreshToken(refresh.body.refreshToken);
    const newSession = await NativeRefreshSessionModel
      .findOne({ tokenHash: newHash })
      .select("+tokenHash")
      .lean()
      .exec();

    assert.ok(oldSession?.revokedAt);
    assert.ok(oldSession?.replacedBySessionId);
    assert.equal(String(oldSession.replacedBySessionId), String(newSession?._id));
    assert.ok(newSession);
    assert.equal(newSession?.revokedAt, undefined);
    assert.equal(newSession?.deviceId, "native-refresh-device");

    const expired = await nativeAuthService.createRefreshSession({
      userId: oldSession.userId,
      deviceId: "expired-device",
    });
    await NativeRefreshSessionModel.updateOne(
      { tokenHash: expired.tokenHash },
      { $set: { expiresAt: new Date("2020-01-01T00:00:00.000Z") } },
    ).exec();
    const expiredRefresh = await postJson(baseUrl, "/auth/native/refresh", {
      refreshToken: expired.token,
    });

    assert.equal(expiredRefresh.status, 401);
    assert.equal(expiredRefresh.setCookie, null);
    assert.equal(JSON.stringify(expiredRefresh.body).includes(expired.token), false);

    const idleExpired = await nativeAuthService.createRefreshSession({
      userId: oldSession.userId,
      deviceId: "idle-expired-device",
    });
    await NativeRefreshSessionModel.updateOne(
      { tokenHash: idleExpired.tokenHash },
      { $set: { idleExpiresAt: new Date("2020-01-01T00:00:00.000Z") } },
    ).exec();
    const idleExpiredRefresh = await postJson(baseUrl, "/auth/native/refresh", {
      refreshToken: idleExpired.token,
    });

    assert.equal(idleExpiredRefresh.status, 401);
    assert.equal(idleExpiredRefresh.setCookie, null);
    assert.equal(JSON.stringify(idleExpiredRefresh.body).includes(idleExpired.token), false);

    console.log("Native refresh integration checks passed");
  } finally {
    if (server) await closeServer(server);
    await mongoose.disconnect();
    await replSet.stop();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const {
  issueAdminCsrf,
  verifyAdminCsrf,
} = require("../src/libs/middleware/admin-csrf");

const createResponse = () => ({
  locals: {},
  status: undefined,
  sendStatus(code) {
    this.status = code;
  },
});

const verify = (method, sessionToken, headerToken, bodyToken) => {
  const req = {
    method,
    session: { adminCsrfToken: sessionToken },
    get: () => headerToken,
    body: bodyToken ? { csrf: bodyToken } : {},
  };
  const res = createResponse();
  let nextCalls = 0;

  verifyAdminCsrf(req, res, () => {
    nextCalls += 1;
  });

  return { status: res.status, nextCalls };
};

const issuedRequest = { session: {} };
const issuedResponse = createResponse();
let issueNextCalls = 0;

issueAdminCsrf(issuedRequest, issuedResponse, () => {
  issueNextCalls += 1;
});

const token = issuedRequest.session.adminCsrfToken;

if (
  !/^[a-f0-9]{64}$/.test(token) ||
  issuedResponse.locals.adminCsrfToken !== token ||
  issueNextCalls !== 1
) {
  throw new Error("CSRF issuance failed");
}

if (verify("GET", undefined, undefined).nextCalls !== 1) {
  throw new Error("Safe request was rejected");
}

if (verify("POST", token, token).nextCalls !== 1) {
  throw new Error("Valid header token was rejected");
}

if (verify("POST", token, undefined, token).nextCalls !== 1) {
  throw new Error("Valid form token was rejected");
}

if (verify("POST", token, "wrong").status !== 403) {
  throw new Error("Invalid token was accepted");
}

if (verify("POST", undefined, undefined).status !== 403) {
  throw new Error("Missing token was accepted");
}

console.log("CSRF middleware checks passed");

import { randomBytes, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import { T } from "../types/common";

export const issueAdminCsrf = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const session = req.session as T;

  if (!session.adminCsrfToken) {
    session.adminCsrfToken = randomBytes(32).toString("hex");
  }

  res.locals.adminCsrfToken = session.adminCsrfToken;
  next();
};

export const verifyAdminCsrf = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const expected = (req.session as T).adminCsrfToken;
  const received = req.get("x-csrf-token") || req.body?.csrf;

  if (typeof expected !== "string" || typeof received !== "string") {
    res.sendStatus(403);
    return;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    res.sendStatus(403);
    return;
  }

  next();
};

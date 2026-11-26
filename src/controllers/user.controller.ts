import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import {
  BuyerSignupInput,
  LoginInput,
  User,
  ExtendedRequest,
  GoogleAuthInput,
  UserUpdateInput,
} from "../libs/types/user";
import UserService from "../models/User.service";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import {
  NativeBuyer,
  NativeLoginInput,
} from "../libs/types/native-auth";
import NativeAuthService from "../models/NativeAuth.service";
import { UserStatus, UserType } from "../libs/enums/user.enum";

// SPA - React uchun

const userController: T = {};

const userService = new UserService();

const authService = new AuthService();

const nativeAuthService = new NativeAuthService();

const nativeLoginFailure = () =>
  new Errors(HttpCode.UNAUTHORIZED, Message.NATIVE_AUTH_FAILED);

const parseNativeLogin = (body: unknown): NativeLoginInput => {
  if (!body || typeof body !== "object") throw nativeLoginFailure();

  const input = body as Record<string, unknown>;
  const userNick = typeof input.userNick === "string"
    ? input.userNick.trim()
    : "";
  const userPassword = typeof input.userPassword === "string"
    ? input.userPassword
    : "";
  const deviceId = typeof input.deviceId === "string"
    ? input.deviceId.trim()
    : "";
  const deviceLabel = typeof input.deviceLabel === "string"
    ? input.deviceLabel.trim()
    : undefined;

  if (!userNick || !userPassword || !deviceId || userNick.length > 128
    || deviceId.length > 128 || (deviceLabel && deviceLabel.length > 128)) {
    throw nativeLoginFailure();
  }

  return { userNick, userPassword, deviceId, deviceLabel };
};

const toNativeBuyer = (user: User): NativeBuyer => ({
  _id: user._id,
  userNick: user.userNick,
  userEmail: user.userEmail,
  userPhone: user.userPhone,
  userAddress: user.userAddress,
  userDesc: user.userDesc,
  userImage: user.userImage,
  userPoints: user.userPoints,
  userLikes: user.userLikes,
});

const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    maxAge: AUTH_TIMER * 3600 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

userController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");

    const input: BuyerSignupInput = {
      userNick: req.body.userNick,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone,
      userPassword: req.body.userPassword,
      userAddress: req.body.userAddress,
      userDesc: req.body.userDesc,
      userImage: req.body.userImage,
    },
      result: User = await userService.signup(input);
    //TODO: TOKENS AUTHENTICATION
    const token = await authService.createToken(result);

    // TODO: TOKEN Cookie ga joylash
    setAccessTokenCookie(res, token);

    res.json({ user: result });
  } catch (err) {
    console.log("ERROR, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body;
    const result = await userService.login(input);

    const token = await authService.createToken(result);

    // TODO: TOKEN Cookie ga joylash
    setAccessTokenCookie(res, token);

    res.json({ member: result });
  } catch (err) {
    console.log("ERROR, login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.nativeLogin = async (req: Request, res: Response) => {
  try {
    const input = parseNativeLogin(req.body);
    const user = await userService.login({
      userNick: input.userNick,
      userPassword: input.userPassword,
    });

    if (
      user.userType !== UserType.BUYER
      || user.userStatus !== UserStatus.ACTIVE
    ) {
      throw nativeLoginFailure();
    }

    const accessToken = authService.createNativeAccessToken(user);
    const refreshToken = await nativeAuthService.createRefreshSession({
      userId: user._id,
      deviceId: input.deviceId,
      deviceLabel: input.deviceLabel,
    });

    return res.status(HttpCode.OK).json({
      user: toNativeBuyer(user),
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof Errors) {
      return res.status(HttpCode.UNAUTHORIZED).json(nativeLoginFailure());
    }

    console.error("Native buyer login failed");
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.googleAuth = async (req: Request, res: Response) => {
  try {
    const input = req.body as GoogleAuthInput;
    const profile = await authService.verifyGoogleCredential(input.credential);
    const result = await userService.signInWithGoogle(profile, {
      userNick: input.userNick,
      userPhone: input.userPhone,
    });
    const token = await authService.createToken(result);

    setAccessTokenCookie(res, token);
    res.json({ user: result });
  } catch (err) {
    console.log("ERROR, Google auth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.getUserDetail = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getUserDetail");
    const result = await userService.getUserDetail(req.user);

    return res.status(HttpCode.OK).json({ user: result });
  } catch (err) {
    console.log("ERROR, getUserDetail:", err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.logout = async (
  _req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("logout");
    res.cookie("accessToken", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("ERROR, logout:", err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.updateUser = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("updateUser");
    const input = req.body as UserUpdateInput;

    if (req.file) {
      input.userImage = req.file.path.replace(/\\/g, "/");
    }

    const result = await userService.updateUser(req.user, input);
    return res.status(HttpCode.OK).json({ user: result });
  } catch (err) {
    console.log("ERROR, updateUser:", err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

userController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : undefined;

    const cookieToken = req.headers.cookie
      ?.split(";")
      .map((cookie) => cookie.trim().split("="))
      .find(([name]) => name === "accessToken")?.[1];

    const token = bearerToken ?? cookieToken;

    if (token) {
      req.user = await authService.checkAuth(decodeURIComponent(token));
    }

    if (!req.user) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    }

    return next();
  } catch (err) {
    console.log("ERROR, verifyAuth:", err);
    if (err instanceof Errors) {
      return res.status(err.code).json(err);
    }

    return res.status(HttpCode.UNAUTHORIZED).json({
      message: Message.NOT_AUTHENTICATED,
    });
  }
};

export default userController;

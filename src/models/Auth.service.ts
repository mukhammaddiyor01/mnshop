import { AUTH_TIMER } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { GoogleProfile, User } from "../libs/types/user";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

class AuthService {
    private readonly secretToken: string;
    private readonly googleClientId?: string;
    private readonly googleClient: OAuth2Client;

    constructor() {
        const secretToken =
            process.env.SECRET_TOKEN ?? process.env.SESSION_SECRET;

        if (!secretToken) {
            throw new Error("SECRET_TOKEN or SESSION_SECRET is required");
        }

        this.secretToken = secretToken;
        this.googleClientId = process.env.GOOGLE_CLIENT_ID;
        this.googleClient = new OAuth2Client();
    }

    public async createToken(payload: User): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(payload, this.secretToken, {
                expiresIn: AUTH_TIMER * 60 * 60,
            }, (error: Error | null, token?: string) => {
                if (error || !token) {
                    reject(
                        new Errors(
                            HttpCode.UNAUTHORIZED,
                            Message.TOKEN_CREATION_FAILED
                        )
                    );
                    return;
                }

                resolve(token);
            });
        });
    }

    public async checkAuth(token: string): Promise<User> {
        const result = jwt.verify(token, this.secretToken) as User;
        console.log(`--- [AUTH] userNick: ${result.userNick} ---`);
        return result;
    }

    public async verifyGoogleCredential(
        credential: string,
    ): Promise<GoogleProfile> {
        if (!credential || !this.googleClientId) {
            throw new Errors(
                HttpCode.UNAUTHORIZED,
                Message.GOOGLE_AUTH_FAILED,
            );
        }

        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: credential,
                audience: this.googleClientId,
            });
            const payload = ticket.getPayload();

            if (
                !payload?.sub ||
                !payload.email ||
                payload.email_verified !== true
            ) {
                throw new Errors(
                    HttpCode.UNAUTHORIZED,
                    Message.GOOGLE_AUTH_FAILED,
                );
            }

            return {
                googleId: payload.sub,
                email: payload.email.toLowerCase(),
                name: payload.name || payload.email.split("@")[0],
                image: payload.picture,
            };
        } catch (error) {
            if (error instanceof Errors) throw error;
            throw new Errors(
                HttpCode.UNAUTHORIZED,
                Message.GOOGLE_AUTH_FAILED,
            );
        }
    }
}

export default AuthService;

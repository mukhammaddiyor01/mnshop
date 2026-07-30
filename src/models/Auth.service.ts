import { AUTH_TIMER } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { User } from "../libs/types/user";
import jwt from "jsonwebtoken";

class AuthService {
    private readonly secretToken: string;

    constructor() {
        const secretToken =
            process.env.SECRET_TOKEN ?? process.env.SESSION_SECRET;

        if (!secretToken) {
            throw new Error("SECRET_TOKEN or SESSION_SECRET is required");
        }

        this.secretToken = secretToken;
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
}

export default AuthService;

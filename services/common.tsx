import { encryptAES } from "../util/crypto";
import { fetchClient } from "./FetchClient";

export type userLoginAuth = { email: string, password: string }
export type userRegisterAuth = { name: string, email: string, password: string }
export type forgotPasswordAuth = { email: string }
export type resetPasswordAuth = { token: string, newPassword: string, email: string }

export const UserAuthService = {
    loginEmail: (data: userLoginAuth) => fetchClient(`/auth/login/email`, {
        method: "POST",
        body: JSON.stringify({
            login: {
                grantType: "password",
                email: encryptAES(data.email),
                password: encryptAES(data.password),
            },
            recaptcha: {
                token: "03AFcWeA6Jlc8qA8lQ..."
            },
        })
    })
};



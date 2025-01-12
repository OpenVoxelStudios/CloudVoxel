import { CredentialsSignin } from "next-auth";

export class RateLimitedError extends CredentialsSignin {
    code = 'RateLimited';
}

export enum Error {
    Configuration = "Configuration",
    CredentialsSignin = "CredentialsSignin",
    AccessDenied = "AccessDenied",
    AuthError = "AuthError",
    RateLimited = "RateLimited",
}

const errorCodeMap = {
    configuration: Error.Configuration,
    credentials: Error.CredentialsSignin,
    access_denied: Error.AccessDenied,
    auth_error: Error.AuthError,
};

const errorMap = {
    [Error.Configuration]: {
        message: "There was a problem with the server configuration. Please contact us if this error persists."
    },
    [Error.CredentialsSignin]: {
        message: "Invalid credentials or account does not exist."
    },
    [Error.AccessDenied]: {
        message: "You do not have the permission to access the dashboard."
    },
    [Error.AuthError]: {
        message: "There was an error with the authentication provider. Please try again later."
    },
    [Error.RateLimited]: {
        message: "You have been rate limited. Please try again later."
    }
}

export function parseError(error: string): { message: string } {
    if (error in errorCodeMap) error = errorCodeMap[error as keyof typeof errorCodeMap];
    return error in errorMap ? errorMap[error as Error] : { message: "An unknown error occurred." };
}
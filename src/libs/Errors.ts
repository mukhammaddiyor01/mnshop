export enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDED = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    INVALID_PRODUCT_DATA = "Product data is invalid!",
    PRODUCT_ALREADY_EXISTS = "This product already exists!",
    PRODUCT_IMAGE_REQUIRED = "At least one product image is required!",
    UPDATE_FAILED = "Update is failed!",


    USED_NICK_PHONE = "You are inserting already used nick or phone!",
    NO_USER_NICK = "No User with that User Nick!",
    BLOCKED_USER = "You have been blocked, contact Restaurnt!",
    WRONG_PASSWORD = "Wrong password entered, please try again!",
    NOT_AUTHENTICATED = "You are not authenticated, Please login first!",
    TOKEN_CREATION_FAILED = "Token creation failed!",
}

class Errors extends Error {
    public code: HttpCode;
    public message: Message;

static standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
}

    constructor(statusCode: HttpCode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}


export default Errors;

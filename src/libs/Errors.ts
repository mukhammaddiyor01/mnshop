export enum Httpcode {
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
    UPDATE_FAILED = "Update is failed!",
}

class Errors extends Error {
    public code: Httpcode;
    public message: Message;

    constructor(statusCode: Httpcode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}


export default Errors;
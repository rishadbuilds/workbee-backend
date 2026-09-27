export const ErrorMessages = {
    USER: {
        NOT_FOUND: "User not found",
        ALREADY_EXISTS: 'User alredy exists',
        INVALID_CREDENTIALS: "Invalid email or passowrd",
        INVALID_PASSWORD: "Invalid password",
        NOT_VERIFIED: "User email is not verified",
        DONT_GET_OTP: 'didnt get otp',
        INVALID_OTP: 'invalid otp',
        OTP_EXPIRED: "otp expired",
        TOKEN_IS_MISSING: "token is missing",
        INVALID_USER: "invalid user"
    },

    AUTH: {
        TOKEN_EXPIRED: "Authentication token expired",
        UNAUTHORIZED: "Unauthorized access",
        ATUH_HEADER_IS_MISSING: "Authorization header is missing",
        INVALID_REFRESH_TOKEN: "invalid refresh token",
        REFRESH_TOKEN_NOT_FOUND: "refresh token not fond",
        USER_UNAUTHENTICATED: 'User not authenticated',
    },

    ADMIN: {
        ADMIN_NOT_FOUND: "Admin not found proviced email is wrong",
        WRONG_PASSWORD: "provided admin password was wrong"
    },

    COMMON: {
        USERID_WORKERID_CANNOT_SAME: "User ID and Worker ID cannot be the same",
    },

    GENERAL: {
        SERVER_ERROR: "Something went wrong, Please try again later",
        INTERNAL_SERVER_ERROR: "Someting wrong Internal server error",
        BAD_REQUEST: "Invalid request",
        NOT_FOUND_OTP: 'user not found when sent otp'
    },
    CHAT: {
        INVALID_CHAT_ID: "invalid chat id",
        CHAT_NOT_FOUND:'Chat not found',
    },
    BID: {
        BID_NOT_FOUND: 'Bid not found',
        BID_FINALIZED: 'This negotiation has already been finalized',
        NOT_YOUR_TURN: 'It is not your turn to respond',
        OFFER_AMOUNT_NOT_VALID: 'Offer amount must be greater than zero',
        ONLY_WORKER_CAN_MAKE_THE_FIRST_OFFER: 'Only the worker can make the first offer',
        ONE_COUNTER_OFFER_IS_ALLOWED: 'Only one counter offer is allowed'
    }


}
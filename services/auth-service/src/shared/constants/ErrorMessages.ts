export const ErrorMessages = {
    USER:{
            NOT_FOUND:"User not found",
            ALREADY_EXISTS:'User alredy exists',
            INVALID_CREDENTIALS:"Invalid email or passowrd",
            INVALID_PASSWORD:"Invalid password",
            NOT_VERIFIED:"User email is not verified",
            DONT_GET_OTP:'didnt get otp',
            INVALID_OTP:'invalid otp',
            OTP_EXPIRED:"otp expired",
            TOKEN_IS_MISSING:"token is missing",
            NOT_FOUND_USERS:'NOT FOUND USERS',
            ALREADY_VERIFIED:"User is already verified",
            INVALID_USER_ID:"Invalid user id",
            WRON_CURRENT_PASS:"you provided current password was wrong",
            FAILED_TO_UPDATE_PROFILE_IMAGE:"Failed to update profile image",
            BLOCKED:"User was blocked",
            WRONG_USER_ID:"wrong user id",
    },

    OTP:{
        OTP_WILL_EXPIRE:"OTP expiry must be in the future"
    },

    AUTH:{
        TOKEN_EXPIRED:"Authentication token expired",
        UNAUTHORIZED:"Unauthorized access",
        ATUH_HEADER_IS_MISSING:"Authorization header is missing",
        INVALID_REFRESH_TOKEN:"invalid refresh token",
        INVALID_OR_EXPIRED_ACCESS_TOKEN:"Invalid or expired access token",
        REFRESH_TOKEN_NOT_FOUND:"refresh token not fond",
        USERIDS_MUST_BE_ARRAY:'userIds must be an array',
        INVALID_TOKEN:'Invalid token',
        INVALID_USER_ID:'Invalid user id',
        ADMIN_ACCOUNT_CANNOT_BE_BLOCK:"Admin accounts cannot be blocked",
        INVALID_GOOGLE_CREDN:'Invalid google credential'
    },

    ADMIN:{
        ADMIN_NOT_FOUND:"Admin not found proviced email is wrong",
        WRONG_PASSWORD:"provided admin password was wrong"
    },

    WORKER:{
        WORKER_VALIDATION_FAILED:"Worker validation failed",
        FAILED_TO_CHANGE_PASS:"Failed to change worker password"
    },

    GENERAL:{
        SERVER_ERROR:"Something went wrong, Please try again later",
        INTERNAL_SERVER_ERROR:"something went wrong, Internal server error accured",
        BAD_REQUEST:"Invalid request",
        NOT_FOUND_OTP:'user not found when sent otp'
    },
    WORK:{
        WRONG_WORK_ID:"wrong work id"
    }


}
export const ResponseMessage = {
    GENERAL: {
        SUCCESS: "Request successfull",
        FAILURE: "Request failed",
        NOT_FOUND: "Resource not found",
        LOGED_OUT:"Logged out successfully"
    },

    TOKEN: {
        REFRESH_TOKEN_IS_REQUIRED:"Refresh token is required",
        TOKEN_REFRESHED:"Token refreshed successfully"
    },

    AUTH: {
        ALREADY_EXISTS: "User already exists",
        USER_NOT_AUTHENTICATED:"User not authenticated",
        WORKER_LOGGED:"Worker logged in successfully"
    },

    USER:{
        REGISTERD_SUCCESSFULLY:"User registered successfully",
        LOGINED_SUCCESFULLY:"User Logined successful",
        VERFIFIED:"user verified successfully",
        SENT_RESET_LINK:"Reset link sent successfully",
        PASSOWORD_UPDATED:"password reset successfully",
        USER_PROFILE_RETRIEVED:'User profile retrieved FROM auth service',
        USER_PROFILES_ARE_RETRIEVED:'User profiles are retrieved FROM auth service',
        GET_USER_PROFILE_DETAILS:'get user profile settings details successfully',
        CHANGE_PASS_SUCCESSFULLY:'CHANGED user password successfully',
        GET_UPLOAD_SIGNATURE:'successfully got cloudinary upload signature',
        PROFILE_IMAGE_UPDATED:"Profile image updated successfully",
        PROFILE_UPDATED:"Profile updated successfully",
    },

    ADMIN:{
        LOGINED_SUCCESFULLY:"admin Verified Logined successful",
        GET_USERS:"get suers successfully",
        ADMIN_BLOCKED_USER:'admin blocked this user',
        GET_USER_STATS:'get users stat'
    },
    WORKER:{
        CHANGED_WORKER_PASS:"Password changed successfully",
        PASSWORD_SESET:"Password reset successfully. Please login with your new password.",
        RESET_LINK_SENT:"If an approved worker account exists for this email, a reset link has been sent.",
    },

    OTP: {
        SENT: "OTP sent successfully",
        EXPIRED: "OTP expired",
        VERIFIED:"OTP verified successfully",
        INVALID: "Invalid OTP",
        OTP_RESENT:"otp has been resent successfully"
    },
}
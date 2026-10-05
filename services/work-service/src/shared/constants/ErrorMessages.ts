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
    },

    AUTH: {
        TOKEN_EXPIRED: "Authentication token expired",
        UNAUTHORIZED: "Unauthorized access",
        UNAUTHORIZED_TO_DELETE_THIS_WORK: "Unauthorized to delete this work",
        ATUH_HEADER_IS_MISSING: "Authorization header is missing",
        USER_ID_REQUIRED: "User ID is required"
    },

    ADMIN: {
        ADMIN_NOT_FOUND: "Admin not found proviced email is wrong",
        WRONG_PASSWORD: "provided admin password was wrong",
        BOOKINGS:{
            CANNOT_AFTER_DATE:"fromDate cannot be after toDate",
            INVALID_TO_DATE:"Invalid toDate",
            INVALID_FROM_DATE:"Invalid fromDate",
            INVALID_STATUS:"Invalid status filter",
        }
    },

    GENERAL: {
        SERVER_ERROR: "Something went wrong, Please try again later",
        BAD_REQUEST: "Invalid request",
        NOT_FOUND_OTP: 'user not found when sent otp',
        INTERNAL_SERVER_ERROR: "Internal server error"
    },

    WORKER: {
        WORKER_ID_MUST_BE_ARRAY: 'workerIds must be an array',
        WRONG_WORKER_ID: 'wrong worker id',
        WORKER_NOT_FOUND: "Worker not found",
        WORKER_NOT_FOUND_TO_BLOCK: "Worker not found to block",
        WORKER_ID_REQUIRED: "Worker ID is required",
        FAILED_TO_UPDATE_PROFILE_IMAGE: "failed to update profile image",
    },
    WORK: {
        WRONG_WORK_ID: 'wrong work id',
        FAILED_TO_RETRIEVE_WORKS: "Failed to retrieve works",
        WORK_NOT_FOUND: "work not found",
        FAILD_TO_DELETE_WORK: "Failed to delete work",
        DONT_HAVE_PERMISSION_TO_UPDATE: "You do not have permission to update this work",
        FAILED_TO_UPDATE_WORK: "Failed to update work",
    },
    APPLY: {
        VALID_STATUS_REQUIRED: "Valid status (approved or rejected) is required",
        REJUCTION_REASON_REQUIRED: "Rejection reason is required when rejecting an application",

    },
    REVIEW: {
        INVALID_RATING: "Rating must be between 1 and 5",
        TESTIMONIAL_TOO_LONG: "Testimonial must be under 500 characters",
        WORK_NOT_COMPLETED: "Work must be completed before it can be reviewed",
        ALREADY_REVIEWED: "This work has already been reviewed",
    },
    DISPUTE: {
        COMPLAINT_TYPE_REQUIRED: "Please select a complaint type.",
        DESCRIPTION_TOO_SHORT: "Please describe the issue in at least 10 characters.",
        TOO_MANY_IMAGES: "You can upload a maximum of 2 images.",
        DISPUTE_NOT_FOUND: "Dispute not found.",
        INVALID_DISPUTE_ID: "Invalid dispute id.",
        REASON_REQUIRED: "Please provide a reason (min 5 characters) for this action.",
        INVALID_ACTION_TYPE: "Invalid dispute action type.",
        ACTION_FAILED: "Failed to apply the requested action.",
    },
}
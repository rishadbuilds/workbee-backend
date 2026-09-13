export const ResponseMessage = {
    GENERAL: {
        SUCCESS: "Request successfull",
        FAILURE: "Request failed",
        NOT_FOUND: "Resource not found",
    },

    AUTH: {
        ALREADY_EXISTS: "Worker already exists",
        BLOCKED_WORKER: "Blocked worker",
        REAPPLY_NOT_ALLOWED: "reapply is not allowed",
    },

    WORKER: {
        NOT_FOUND:"worker not found",
        APPLIED: "Worker applied successfully!",
        REGISTERD_SUCCESSFULLY: "Worker registered successfully",
        GET_ALL_APPLIERS: "Successfully fetched all appliers",
        DONT_GET_APPLIERS: "didt get newappliers in getusecase leryer",
        WORKER_ASSIGNED_WORK_RETRIEVED: "Worker assigned works retrieved successfully",
        WORKER_PROFILE_RETRIEVED: 'Worker profiles retrieved',
        WORKER_PROFILE_RETRIEVED_BATCH: 'Worker profiles retrieved BATCH',
        GET_WORKER_PROFILE: "Worker profile fetched successfully",
        UPLOAD_SIGN_GENERATED: "Worker upload signature generated",
        PROFILE_STAT_RETRIEVED: "Worker profile stats retrieved",
        WORKER_PROFILE_IMAGE_UPDATED: "Worker profile image updated successfully",
        WORKER_PROFILE_UPDATED: "Worker profile updated successfully",
    },
    REVIEW: {
        CREATED_REVIEW: "review created successfully",
        CHECKED_REVIEW_STATUS: "Checked review status",
    },
    WORK: {
        WORK_STATUS_UPDATED: "Worker status updated successfully",
        WORK_BOOKED: "Task booked successfully",
        RETRIEVED_WORKS: "Successfully retrieved user works",
        WORK_UPDATED: "Work updated successfully",
        WORK_DELETED: "Work deleted successfully",
        UPLOAD_SIGN_GENERATED: "upload sign are generated to store work post medias",
    },
    DISPUTE: {
        UPLOAD_SIGN_GENERATED: "Upload signature generated",
        CREATED: "Complaint submitted successfully",
        RETRIEVED: "Disputes retrieved successfully",
        ACTION_APPLIED: "Action applied successfully",
    },

}
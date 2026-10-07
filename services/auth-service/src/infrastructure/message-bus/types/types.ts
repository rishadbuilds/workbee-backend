/** user disute consumer */
export interface UserDisputeActionRequest {
  correlationId: string;
  userId: string;
  actionType: "block" | "unblock" | "blacklist" | "unblacklist" | "warning_email";
  reason: string;
}

export interface UserDisputeActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}


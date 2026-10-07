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

/** user profile consumer */
export interface UserProfileRpcRequestMsg {
  correlationId: string;
  userId: string;
}

/** WorkerEventConsumer */
export interface IWorkerBlockedEvent {
  workerId: string;
  isBlocked: boolean;
}
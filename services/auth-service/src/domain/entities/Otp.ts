/** OTP interface */

export interface Otp {
    id?:string;
    userId:string;
    otp:string;
    expiresAt:Date;
    createdAt?:Date;
}
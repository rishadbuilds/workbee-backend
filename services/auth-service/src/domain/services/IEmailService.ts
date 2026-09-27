/** email service interface */

export interface IEmailService {
    sendOtp(to: string, otp: string): Promise<void>;
    sendResentPasswordLink(to: string, link: string): Promise<void>;
    sendWarningEmail(to: string, name: string, reason: string): Promise<void>;
    sendBlacklistedEmail(to: string, name: string, reason: string): Promise<void>;
}
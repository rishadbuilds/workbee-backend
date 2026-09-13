import { injectable } from "tsyringe";
import nodemailer from "nodemailer"
import { IEmailService } from "../../domain/services/IEmailService";
import { ENV } from "../config/env";

@injectable()
export class EmailService implements IEmailService {
    private transporter;

    constructor() {
        // console.log('hited email service transporter seviceeeee');

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: ENV.EMAIL_USER,
                pass: ENV.EMAIL_PASSKEY
            }
        })
    }

    async sendOtp(to: string, otp: string) {
        const mailOption = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Your OTP for WorkBee Registration',
            text: `Your OTP is: ${otp}, it will be expire in 5 minutes`
        }
        // console.log(JSON.stringify(mailOption),'meilserviceeeeeeee')
        await this.transporter.sendMail(mailOption)
    }

    //forgot pass reset link
    async sendResentPasswordLink(to: string, link: string) {
        const mailOption = {
            from: process.env.EMAIL_USER,
            to,
            subject: "WorkBee - Reset Password Link",
            text: `Click the following link to reset you WorkBee password : ${link}\n this link will expire after 10 minutes`
        }
        await this.transporter.sendMail(mailOption)
    }

    async sendWarningEmail(to: string, name: string, reason: string): Promise<void> {
        const mailOption = {
            from: process.env.EMAIL_USER,
            to,
            subject: "⚠️ WorkBee - Important Notice Regarding Your Account",
            text: `Dear ${name},\n\nFollowing a review of a complaint filed against your account, we are issuing the following warning:\n\n${reason}\n\nPlease ensure this does not happen again.\n\n- The WorkBee Team`,
        };
        await this.transporter.sendMail(mailOption);
    }

    async sendBlacklistedEmail(to: string, name: string, reason: string): Promise<void> {
        const mailOption = {
            from: process.env.EMAIL_USER,
            to,
            subject: "WorkBee - Account Blacklisted",
            text: `Dear ${name},\n\nFollowing a review of a complaint against your account, your WorkBee account has been blacklisted.\n\nReason: ${reason}\n\nIf you believe this is a mistake, please contact support.\n\n- The WorkBee Team`,
        };
        await this.transporter.sendMail(mailOption);
    }
}


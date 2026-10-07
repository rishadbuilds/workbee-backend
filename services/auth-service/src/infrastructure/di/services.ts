import { container } from "tsyringe";

/** service registrations */

import { HashService } from "../services/HashService";
import { TokenService } from "../services/TokenService";
import { EmailService } from "../services/EmailService";
import { OtpService } from "../services/OtpService";

//service interfaces
import { ITokenService } from "../../domain/services/ITokenService";
import { IHashService } from "../../domain/services/IHashService";
import { IEmailService } from "../../domain/services/IEmailService";
import { IOtpService } from "../../domain/services/IOtpService";
import { CloudinaryService } from "../services/CloudinaryService";
import { ICloudinaryService } from "../../domain/services/ICloudinaryService";
import { WorkerResetTokenService } from "../services/WorkerResetTokenService";
import { IWorkerResetTokenService } from "../../domain/services/IWorkerResetTokenService";

//bind sevices as singletons
container.registerSingleton<IHashService>("HashService", HashService);
container.registerSingleton<ITokenService>("TokenService", TokenService);
container.registerSingleton<IEmailService>("EmailService", EmailService);
container.registerSingleton<IOtpService>("OtpService", OtpService);
container.registerSingleton<ICloudinaryService>("CloudinaryService",CloudinaryService);
container.registerSingleton<IWorkerResetTokenService>("WorkerResetTokenService",WorkerResetTokenService);



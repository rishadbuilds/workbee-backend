
import { container } from "tsyringe";

import { HashService } from "../services/HashServices";

import { IHashService } from "../../domain/services/IHashService";

import { IEmailService } from "../../domain/services/IEmailService";
import { EmailService } from "../services/EmailService";
import { CloudinaryService } from "../services/CloudinaryService";
import { ICloudinaryService } from "../../domain/services/ICloudinaryService";

container.registerSingleton<IHashService>("HashService",HashService)
container.registerSingleton<IEmailService>("EmailService",EmailService)

//cloudinary
container.registerSingleton<ICloudinaryService>("CloudinaryService",CloudinaryService)

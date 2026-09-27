import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { HttpStatus } from '../../shared/enums/HttpStatus';
import { ResponseHelper } from '../../shared/helpers/responseHelper';
import { getErrorMessage } from 'workbee-common';
import { logger } from '../../infrastructure/logger/logger';
import { ICloudinaryService } from '../../domain/services/ICloudeService';

/** 
 * upload controller 
 * cloudinary
 * */

@injectable()
export class UploadController {
  constructor(
    @inject('CloudinaryService') private readonly _cloudinaryService: ICloudinaryService
  ) { }

  async getUploadSignature(req: Request, res: Response) {
    try {
      const resourceType = req.query.resourceType === 'video' ? 'video' : 'image';
      const folder = resourceType === 'video' ? 'chat/videos' : 'chat/images';

      const { signature, timestamp } = this._cloudinaryService.generateUploadSignature({ folder });

      return res.status(HttpStatus.OK).json(
        ResponseHelper.success({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder,
            resourceType,}, 'Signature generated'));
    } catch (error) {
      logger.error('upload controller upload signature error:', error);
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseHelper.error(getErrorMessage(error), HttpStatus.BAD_REQUEST));
    }
  }
}
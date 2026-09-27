import { Router } from 'express';
import { container } from 'tsyringe';
import { UploadController } from '../controllers/Uploadcontroller';

const router = Router();
const uploadController = container.resolve(UploadController);

/** upload routes cloudinary signed */

router.get('/upload/signature', uploadController.getUploadSignature.bind(uploadController));

export default router;

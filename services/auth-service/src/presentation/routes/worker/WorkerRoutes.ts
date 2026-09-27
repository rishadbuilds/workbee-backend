import { Router } from "express";
import { container } from "tsyringe";
import { WorkerController } from "../../controllers/worker/WorkerController";

const router = Router();

const workerController = container.resolve(WorkerController);

/** worker routes */

router.post("/worker-login", workerController.workerLogin.bind(workerController));
router.post("/change-worker-password", workerController.changeWorkerPassword.bind(workerController));
router.get('/user-profile-stat/:userId', workerController.getUserProfile.bind(workerController));

export default router;
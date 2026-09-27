import { Router } from "express";
import { AdminController } from "../../controllers/admin/AdminController";
import { container } from "tsyringe";

const router = Router()

const adminContoller = container.resolve(AdminController)

/** admin routes */

router.post('/admin/login', adminContoller.adminLogin.bind(adminContoller))
router.get('/admin/get-users', adminContoller.getUsers.bind(adminContoller))
router.patch('/admin/block-user/:id', adminContoller.blockUser.bind(adminContoller))
router.get('/admin/user-stats', adminContoller.getUserStats.bind(adminContoller));

export default router


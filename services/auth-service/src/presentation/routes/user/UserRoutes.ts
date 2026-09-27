import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../../controllers/user/UserController";

const router = Router();

const userController = container.resolve(UserController);

/** user routes */

router.post("/register", userController.register.bind(userController));
router.post("/verifyOtp", userController.verifyOtp.bind(userController));
router.post("/resend-otp", userController.resendOtp.bind(userController));
router.post("/login", userController.login.bind(userController));
router.get("/verify", userController.verify.bind(userController))
router.post("/google-login", userController.googleLogin.bind(userController))
router.post("/forgot-password", userController.forgotPassword.bind(userController))
router.post("/reset-password/:token", userController.resetPassword.bind(userController))
router.post("/refresh-token", userController.refreshToken.bind(userController));
router.post("/logout", userController.userLogout.bind(userController));

//profile settings  
router.get("/get-user-profile-settings", userController.getUserProfileSettings.bind(userController));
router.post("/change-user-password", userController.chageUserPassword.bind(userController))
router.patch("/profile-image", userController.updateProfileImage.bind(userController))
router.patch("/update-user-profile",userController.updateUserProfile.bind(userController));

// image uploads
router.get("/profile-image/upload-signature",userController.getProfileImageUploadSignature.bind(userController));

//inter serv comm
router.get('/get-user-profile/:userId', userController.getUserProfile.bind(userController));
router.post('/get-user-profile/batch', userController.getUserProfilesBatch.bind(userController));

export default router;

import { Router } from "express";
import { createUser, loginUser, logoutUser , getUserProfile, updateUser, updatePassword, searchUsers, updateUserRole, deleteUser} from "../controllers/user.controller.js";
import { sendOTP, verifyOTP } from "../services/auth.services.js";
import { restrict, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', createUser);
router.post('/login', loginUser);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyJWT, verifyOTP);

router.get('/me', verifyJWT, getUserProfile);
router.post('/logout', verifyJWT, logoutUser);
router.post('/update', verifyJWT, updateUser);
router.post('/reset-password', verifyJWT, updatePassword);

router.get('/search', verifyJWT, restrict(["admin","superadmin"]), searchUsers);
router.put('/:id', verifyJWT, restrict(["superadmin"]), updateUserRole);
router.delete('/:id', verifyJWT, restrict(["admin","superadmin"]), deleteUser);

export default router;
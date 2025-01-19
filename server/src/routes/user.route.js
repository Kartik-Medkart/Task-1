import { Router } from "express";
import { createUser, loginUser, logoutUser , getUserProfile, updateUser, updatePassword} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', createUser);
router.post('/login', loginUser);

router.get('/me', verifyJWT, getUserProfile);
router.post('/logout', verifyJWT, logoutUser);
router.post('/update', verifyJWT, updateUser);
router.post('/reset-password', verifyJWT, updatePassword);

export default router;
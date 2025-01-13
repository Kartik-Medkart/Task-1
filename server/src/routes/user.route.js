import { Router } from "express";
import { createUser, loginUser, logoutUser , getUserProfile, updateUser, updatePassword} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', createUser);
router.post('/login', loginUser);

router.use(verifyJWT);
router.get('/me', getUserProfile);
router.post('/logout', logoutUser);
router.post('/update', updateUser);
router.post('/reset-password', updatePassword);

export default router;
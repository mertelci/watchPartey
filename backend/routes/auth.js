import express from "express";
import { login, register, logout, checkAuth, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();


router.post("/register", register);


router.post("/login", login);

router.post("/logout", logout);


router.get("/check", protectRoute, checkAuth)

export default router;

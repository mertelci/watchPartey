import { generateToken } from "../lib/utils.js";
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";


export const register = async (req, res) => {

    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tüm alanları doldurun." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır." });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı." });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();

            generateToken(newUser._id, res);

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }

}



export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }


        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials." });
        }


        generateToken(user._id, res);

        res.status(200).json({
            message: "Giriş başarılı.",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Giriş hatası:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }

}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

export const updateProfile = async (req, res) => {
    try {

        const { profilePic } = req.body
        const userId = req.user._id

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json(updatedUser)

    }

    catch (error) {

        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}
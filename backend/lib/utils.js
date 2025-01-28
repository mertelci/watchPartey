import jwt from "jsonwebtoken";

// JWT oluşturma fonksiyonu
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token 7 gün geçerli olacak
    });

    // Token'ı cookie olarak saklama
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün (ms cinsinden)
        httpOnly: true, // XSS saldırılarına karşı güvenlik
        sameSite: "strict", // CSRF saldırılarına karşı güvenlik
        secure: process.env.NODE_ENV !== "development", // Geliştirme modunda değilse HTTPS üzerinden gönder
    });

    return token;
};

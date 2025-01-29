// config/production.js
import path from 'path';
import express from 'express';

export const setupProduction = (app) => {
    if (process.env.NODE_ENV === "production") {
        const __dirname = path.resolve();
        app.use(express.static(path.join(__dirname, "../frontend/dist")));

        app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
        });
    }
};
// middleware/index.js
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

export const applyMiddlewares = (app) => {
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true
    }));
};
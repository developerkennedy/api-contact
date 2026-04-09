import {Request, Response,NextFunction} from "express";
import {verifyToken} from "./jwt";


export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        req.user = verifyToken(token)
        return next()
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}
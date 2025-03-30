import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

//Using the as JwtPayload is a type assertion in TypeScript. It tells the
// compiler to treat the returned value from jwt.verify as having the
// structure defined by the JwtPayload interface (i.e., it has an id property
//  of type string)

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token, authorization denied",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

export default auth;

import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import { usingOpenId } from "../../services/auth";
import { createUser, getUserByEmail } from "../../services/users";


import { UserModel } from "../../models/UserModel";
import { WatchModel } from "../../models/WatchModel";

export async function getUser(req: AuthRequest, res: Response) {
  // If using SSO, auto-create users in Mongo who we don't recognize yet
  if (!req.userId && usingOpenId()) {
    const user = await createUser(req.name || "", req.email, "", req.verified);
    req.userId = user.id;
  }

  if (!req.userId) {
    throw new Error("Must be logged in");
  }

  const userId = req.userId;

  return res.status(200).json({
    status: 200,
    userId: userId,
    userName: req.name,
    email: req.email,
  });
}

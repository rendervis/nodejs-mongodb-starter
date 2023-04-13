import express from "express";
import { wrapController } from "../wrapController";
import * as usersControllerRaw from "./users.controller";

const router = express.Router();

const usersController = wrapController(usersControllerRaw);

router.get("/", usersController.getUser);


export { router as usersRouter };

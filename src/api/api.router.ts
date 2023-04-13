import { Router, Request } from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import authenticateApiRequestMiddleware from "../middleware/authenticateApiRequestMiddleware";
import { getBuild } from "../util/handler";
import { ApiRequestLocals } from "../../types/api";


const router = Router();


router.use(bodyParser.json({ limit: "1mb" }));
router.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));

router.use(authenticateApiRequestMiddleware);

// Rate limit API keys to 60 requests per minute
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request & ApiRequestLocals) => req.apiKey,
    message: { message: "Too many requests, limit to 60 per minute" },
  })
);

// Index health check route
router.get("/", (req, res) => {
  res.json({
    name: "Render API",
    apiVersion: 1,
    build: getBuild(),
  });
});

// API endpoints


// 404 route
router.use(function (req, res) {
  res.status(404).json({
    message: "Unknown API endpoint",
  });
});

export default router;

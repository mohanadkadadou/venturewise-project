import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Logger middleware
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          method: req.method,
          url: req.url,
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", router);

// Test route (مهم للتأكد أن السيرفر يعمل)
app.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀");
});

export default app;

import "./tracing";
import express from "express";
import { ConnectOptions, connect } from "mongoose";
import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import productRouter from "./routes/ProductRoute";
import { tenantMiddleware } from "./middleware/tenantMiddleware";
import { ProductController } from "./controllers/ProductController";
configDotenv();
const app = express();
const port = process.env.PORT || 3000;

async function run() {
  app.use(bodyParser.json());
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use(tenantMiddleware);
  app.use(productRouter);

  const connectionOptions: ConnectOptions = {};
  const dbUri = process.env.DB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`;
  await connect(dbUri, connectionOptions);

  const productController = new ProductController();
  await productController
    .consumeCartEvent()
    .then(() => console.log("Listening for messages..."))
    .catch((error) => console.error("Error starting consumer:", error));

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

run();

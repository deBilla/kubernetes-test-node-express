import express from "express";
import { ConnectOptions, connect } from "mongoose";
import bodyParser from 'body-parser';
import { configDotenv } from "dotenv";
import productRouter from "./routes/ProductRoute";
configDotenv();
const app = express();
const port = process.env.PORT || 3000;

async function run() {
  app.use(bodyParser.json());
  app.use(productRouter);

  const connectionOptions: ConnectOptions = {};
  await connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.chpgraa.mongodb.net/?retryWrites=true&w=majority`,
    connectionOptions
  );

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

run();

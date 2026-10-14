import express from "express";
import { type Express } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening to port : ${port}`);
});

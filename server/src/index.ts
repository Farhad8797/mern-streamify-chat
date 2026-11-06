import dotenv from "dotenv";
import dbConnect from "./utils/dbConnect.js";
import { server, app } from "./app.js";

dotenv.config();

dbConnect()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Listening to port: ${process.env.PORT}`);
    });
  })
  .catch((err: any) => {
    console.error(`Error connecting to database and listening to port`);
  });

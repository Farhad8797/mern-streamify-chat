import dotenv from "dotenv";
import app from "./app.js";
import dbConnect from "./utils/dbConnect.js";

dotenv.config();

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Listening to port: ${process.env.PORT}`);
    });
  })
  .catch((err: any) => {
    console.error(`Error connecting to database and listening to port`);
  });

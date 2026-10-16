import ImageKit from "@imagekit/nodejs";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

export default client;

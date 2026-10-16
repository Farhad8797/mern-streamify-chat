import client from "../config/imagekit.js";
import * as fs from "fs";

export default async function uploadFile(filepath: string, fileName: string) {
  if (!filepath) return null;
  try {
    const response = await client.files.upload({
      file: fs.createReadStream(filepath),
      fileName: fileName,
    });
    console.log("File uploaded successfully at", response.url);
    return response;
  } catch (err: any) {
    console.log("Error uploading file: ", err?.message || err);
    return null;
  } finally {
    fs.unlink(filepath, (err) => {
      if (err) console.log(`Error deleting file: ${err.message}`);
      else {
        console.log("path/file.txt was deleted");
      }
    });
  }
}

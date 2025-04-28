import express from "express";
import { S3Client } from "@aws-sdk/client-s3";
import csv from "csv-parser";
import Busboy from "busboy";
import { PassThrough } from "stream";
import { randomUUID } from "crypto";
import { Upload } from "@aws-sdk/lib-storage";

const client = new S3Client();

const app = express();

app.post("/upload", (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  const passThrough = new PassThrough();

  let s3Promise;

  busboy.on("file", (fieldname, fileStream, filename, encoding, mimetype) => {
    s3Promise = new Upload({
      client,
      params: {
        Bucket: "random-test-bucket-dan",
        Key: randomUUID(),
        Body: passThrough,
      },
    }).done();

    fileStream
      .pipe(csv())
      .on("data", (row) => {
        console.log(row);
        const csvRow = Object.values(row).join(",") + "\n";
        passThrough.write(csvRow);
      })
      .on("end", () => {
        console.log("finished upload");
        passThrough.end();
        res.send();
      });
  });
  req.pipe(busboy);
});

app.listen(3000, () => {
  console.log("Listening");
});

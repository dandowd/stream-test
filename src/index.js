import express from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { parse } from "fast-csv";
import Busboy from "busboy";
import { PassThrough } from "stream";
import { randomUUID } from "crypto";
import { Upload } from "@aws-sdk/lib-storage";

const client = new S3Client();

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  console.log("request starting");

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
  });

  next();
});

app.post("/upload", (req, res) => {
  console.log("upload start");
  const busboy = Busboy({ headers: req.headers });
  const passThrough = new PassThrough();

  let s3Promise;

  busboy.on("file", (fieldname, fileStream, filename, encoding, mimetype) => {
    console.log("on file");
    let count = 1;
    s3Promise = new Upload({
      client,
      params: {
        Bucket: "random-test-bucket-dan",
        Key: `test-${randomUUID()}`,
        Body: passThrough,
      },
    }).done();

    fileStream
      .pipe(parse())
      .on("data", (row) => {
        if (count === 1) {
          console.log("starting data");
        }
        if (count % 10_000 === 0) {
          console.log(row);
        }
        count++;
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

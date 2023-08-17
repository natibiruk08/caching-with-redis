import express from "express";
import axios from "axios";
import { createClient } from "redis";

const app = express();

const client = createClient({
  url: "redis://127.0.0.1:5000",
});

const DEFAULT_EXPIRATION = 10;

app.get("/photos", async (req, res) => {
  try {
    const { albumId } = req.query;
    await client.connect();

    const photos = await client.get("photos");

    if (photos) {
      return res.json(JSON.parse(photos));
    } else {
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos",
        {
          params: { albumId },
        }
      );

      client.setEx("photos", DEFAULT_EXPIRATION, JSON.stringify(data));

      return res.json(data);
    }
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

app.listen(3000, () => {
  console.log("App is running");
});

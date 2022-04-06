import { config } from "dotenv";
config();
import express, { json, urlencoded } from "express";
import DatabaseHandler from "./DatabaseHandler";
import axios from "axios";

const app = express();

const port: number = 3000;
const deletionTime: number = process.env.TIME && typeof process.env.TIME === "string" && isNaN(Number(process.env.TIME)) ? Number(process.env.TIME) : 60;

const db = new DatabaseHandler(deletionTime);
const cache = new Map<string, { type: string, buffer: Buffer }>();

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (_, res) => {
    res.json({ hello: "world", howToUse: "Use /cache route with ?link param for your static link." });
});

app.get("/cache", async (req, res) => {
    const link: string | undefined = req.query.link as string;
    if (!link) return res.json({ error: true, message: "No link provided." });
    // const dataExist = db.getResponse(link);

    // console.log(dataExist);
    // if (dataExist) return res.json({ error: true, message: "Found the cache. Sending...", response: dataExist });

    const cached = cache.get(link);
    if (cached) {
        res.writeHead(200, { "Content-Type": cached.type });
        return res.end(cached.buffer);
    }

    const response = await axios.get(link, { transformResponse: e => e });
    if (response.headers["content-type"].includes("html")) return res.json({ error: true, message: "HTML request is not allowed." });
    const buffer = Buffer.from(response.data);
    cache.set(link, { type: response.headers["content-type"], buffer });
    res.writeHead(200, { "Content-Type": response.headers["content-type"] });
    res.end(buffer);

});

app.listen(port, (): void => console.log(`Now listening on port ${port}`));
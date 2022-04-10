import { config } from "dotenv";
config();
import express, { json, urlencoded } from "express";
import DatabaseHandler from "./DatabaseHandler";
import axios from "axios";

const app = express();

const port: number = 3000;
const deletionTime: number = process.env.TIME && typeof process.env.TIME === "string" && isNaN(Number(process.env.TIME)) ? Number(process.env.TIME) : 60;

const db = new DatabaseHandler(deletionTime);

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (_, res) => {
    res.json({ message: "Use /cache route with ?link param for your static link." });
});

app.get("/cache", async (req, res) => {
    const link: string | undefined = req.query.link as string;
    if (!link) return res.json({ error: true, message: "No link provided." });
    const cached = db.getResponse(link);
    console.log(cached);
    if (cached) {
        res.writeHead(200, { 
            "Content-Type": cached.type, 
            "Content-Length": cached.buffer.length, 
            "Cache-Control": "public, max-age=604800" 
        });
        return res.end(cached.buffer);
        //return res.json({error: false, message: "Found the cache. Returning it.", response: cached.buffer});
    }

    const response = await axios.get(link, { transformResponse: e => e });
    const type = response.headers["content-type"];
    if (type.includes("html")) return res.json({ error: true, message: "HTML request is not allowed." });
    const buffer = Buffer.from(response.data, 'base64');
    db.addResponse(link, buffer, type);
    res.writeHead(200, { "Content-Type": type});
    res.end(buffer);

});
app.listen(port, (): void => console.log(`Now listening on port ${port}`));
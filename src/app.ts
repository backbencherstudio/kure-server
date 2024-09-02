import express, { Application, Request, Response } from "express";
import core from "cors";
const app: Application = express();


app.use(express.json());
app.use(core());

app.get("/", (req: Request, res: Response) => {
  const a = "cool";
  res.send(a);
});

export default app;

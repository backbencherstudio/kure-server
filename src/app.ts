import express, { Application, Request, Response } from "express";
import core from "cors";
const app: Application = express();

//parser
app.use(express.json());
app.use(core());

app.get("/", (req: Request, res: Response) => {
  const a = 10;
  res.send(a);
});

export default app;

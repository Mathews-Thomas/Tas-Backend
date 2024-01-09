import express from 'express';
import dotenv from 'dotenv';
import database from './config/database.js'
import rootRouter from './routes/index.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config();
database.connect();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(cookieParser())



app.use("/api", rootRouter);
app.use("/", (req, res) => res.status(404).send("Route not found!"))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

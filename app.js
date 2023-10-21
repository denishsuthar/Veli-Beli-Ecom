import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors"
import ErrorMiddelware from "./middelware/error.js"
import adminRoute from "./routes/AdminRoute/adminRoute.js"
import commonRoute from "./routes/commonRoute.js"
import clientRoute from "./routes/ClientRoute/clientRoute.js"
import productRoute from "./routes/ProductRoute/productRoute.js"
import orderRoute from "./routes/OrderRoute/orderRoute.js"

const app = express();

// Config
config({
    path:"./config/config.env"
})

// Middelwares
app.use(express.json());
app.use(bodyParser.json())
app.use(
    cors({
      origin:["http://localhost:3000", process.env.FRONTEND_URL],
      credentials: true,
      methods:["GET", "POST", "PUT", "DELETE"]
    })
);

app.get("/", (req, res)=>{
    res.send("Welcome")
})

app.use("/api", adminRoute)
app.use("/api", commonRoute)
app.use("/api", clientRoute)
app.use("/api", productRoute)
app.use("/api", orderRoute)


export default app;

// Using Custom ErrorMiddleware
app.use(ErrorMiddelware)
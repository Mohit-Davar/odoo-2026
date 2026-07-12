import cookieParser from "cookie-parser";
import express from "express"
import connectDB from "./config/db.js";
import cors from "cors"
import router from "./routes/auth.routes.js";
import vehicleRouter from "./routes/vehicle.route.js";

const app = express();

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", router);
app.use("/api/vehicles", vehicleRouter);

app.get("/",(req , res)=>{
    res.json({
        msg : "Hi there"
    })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log("App is listenting on the PORT : ", PORT);
})

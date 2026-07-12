import cookieParser from "cookie-parser";
import express from "express"
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import vehicleRouter from "./routes/vehicle.route.js";
import driverRouter from "./routes/driver.route.js";
import tripRoutes from "./routes/trip.routes.js";
import fuelRoutes from "./routes/fuel.routes.js";
import expenseRoutes from "./routes/expense.routes.js";

const app = express();

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/",(req , res)=>{
    res.json({
        msg : "Hi there"
    })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log("App is listenting on the PORT : ", PORT);
})

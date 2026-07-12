import cookieParser from "cookie-parser";
import express from "express"
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import vehicleRouter from "./routes/vehicle.route.js";
import driverRouter from "./routes/driver.route.js";
import tripRoutes from "./routes/trip.routes.js";
import maintenanceRoutes from "./routes/maintenance.route.js";
import fuelRoutes from "./routes/fuel.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import documentRoutes from "./routes/document.routes.js";
import scheduleEmailReminders from "./utils/cron.js";

const app = express();

app.use(cors({
    origin : process.env.FRONTEND_URL || "http://localhost:3000",
    credentials : true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();
scheduleEmailReminders();

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/trips", tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/documents", documentRoutes);

app.get("/",(req , res)=>{
    res.json({
        msg : "Hi there"
    })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log("App is listenting on the PORT : ", PORT);
})

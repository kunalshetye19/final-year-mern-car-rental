dotenv.config();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet"; // Helmet helps secure Express apps by setting various HTTP headers
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import carRouter from "./routes/carRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import vendorRouter from "./routes/vendorRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Connection
connectDB();

// MIDDLEWARES
app.use(cors());
// Request logging
app.use(morgan('dev'));

// HELMET FIX: This section is critical to fix the ERR_BLOCKED_BY_RESPONSE error
app.use(
    helmet({
        // Allows images/resources to be shared across different origins (Frontend port 5173 to Backend port 5000)
        crossOriginResourcePolicy: { policy: "cross-origin" },
        // Disabling this prevents the browser from blocking images due to "Not-Same-Origin" policies
        crossOriginEmbedderPolicy: false, 
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES SERVING
// Using path.join with __dirname ensures the folder is found regardless of where you start the server from
// STATIC FILES SERVING
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api/auth", userRouter);
app.use("/api/cars", carRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/vendors", vendorRouter);

// Health Check
app.get("/api/ping", (req, res) =>
    res.json({
        ok: true,
        time: Date.now()
    })
);

// Root Route
app.get("/", (req, res) => {
    res.send("API WORKING");
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Critical Server Error:", err.stack);

    // If headers already sent, we MUST delegate to default express handler
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// LISTEN
app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
});

console.log("ENV TEST:", process.env.STRIPE_SECRET_KEY);


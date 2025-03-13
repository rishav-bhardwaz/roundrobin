import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import Coupon from "./models/Coupon.js";
import couponRoutes from "./routes/couponRoutes.js";

dotenv.config();
const app = express();
connectDB().then(() => seedCoupons());

const allowedOrigins = [
  "http://localhost:5173",
  "https://roundrobin-afc1a5m3v-rishav-bhardwazs-projects.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/coupons", couponRoutes);

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

//25 hardcode coupons
async function seedCoupons() {
  try {
    const existingCoupons = await Coupon.countDocuments();
    if (existingCoupons === 0) {
      const coupons = Array.from({ length: 25 }, (_, i) => ({
        code: `COUPON${1000 + i}`,
        claimedBy: null,
        claimedAt: null,
      }));

      await Coupon.insertMany(coupons);
      console.log("25 Coupons Preloaded Successfully!");
    } else {
      console.log("Coupons already exist. Skipping preload.");
    }
  } catch (error) {
    console.error("Error preloading coupons:", error.message);
  }
}

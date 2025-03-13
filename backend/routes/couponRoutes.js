import express from "express";
import Coupon from "../models/Coupon.js";

const router = express.Router();
const CLAIM_COOLDOWN = 60 * 60 * 1000; 

const assignCoupon = async (userIdentifier) => {
  const availableCoupons = await Coupon.find({ claimedBy: null });
  if (availableCoupons.length === 0) return null;

  const coupon = availableCoupons[0]; 
  coupon.claimedBy = userIdentifier;
  coupon.claimedAt = new Date();
  await coupon.save();

  return coupon;
};

// this will check if user is abusing the coupon system
const checkAbuse = async (req, res, next) => {
  const userIP = req.ip;
  const userCookie = req.cookies["user-session"] || userIP;

  const lastClaim = await Coupon.findOne({ claimedBy: userCookie }).sort({ claimedAt: -1 });
  
  if (lastClaim) {
    const timePassed = Date.now() - lastClaim.claimedAt.getTime();
    if (timePassed < CLAIM_COOLDOWN) {
      return res.status(429).json({
        message: `You must wait ${Math.ceil((CLAIM_COOLDOWN - timePassed) / 60000)} minutes before claiming again.`,
      });
    }
  }

  req.userIdentifier = userCookie;
  next();
};

// claim the coupon 
router.post("/claim", checkAbuse, async (req, res) => {
  const coupon = await assignCoupon(req.userIdentifier);
  if (!coupon) return res.status(400).json({ message: "No coupons available" });

  res.cookie("user-session", req.userIdentifier, { httpOnly: true, maxAge: CLAIM_COOLDOWN });
  res.json({ message: `Coupon ${coupon.code} claimed successfully!` });
});

router.get("/", async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
});

export default router;

import express from "express";
import {
    getVendors,
    vendorLogin,
    vendorRegister,
    updateVendor,
    deleteVendor,
    getVendorIncome
} from "../controllers/vendorController.js";

const router = express.Router();

// Public routes
router.get("/", getVendors);

// Authentication routes only - vendors manage themselves via vendor portal
router.post("/login", vendorLogin);
router.post("/register", vendorRegister);

// Vendor income route
router.get("/:id/income", getVendorIncome);

// Admin management routes
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;

import Vendor from "../models/vendorModel.js";

// Get all vendors (public - for frontend to display)
export const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select("-password").sort({ createdAt: -1 });
        res.json({
            success: true,
            data: vendors
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch vendors' });
    }
};

// Vendor Login
export const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await vendor.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Return vendor without password
        const vendorData = vendor.toObject();
        delete vendorData.password;

        res.json({
            success: true,
            message: "Login successful",
            data: vendorData
        });
    } catch (err) {
        console.error('vendorLogin error:', err && err.stack ? err.stack : err);
        res.status(500).json({ success: false, message: err.message || 'Login failed', stack: err.stack });
    }
};

// Vendor Registration
export const vendorRegister = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existing = await Vendor.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Vendor with that email already exists" });
        }

        const vendor = new Vendor({
            name,
            email,
            password,
            phone: phone || "",
            address: address || ""
        });

        const saved = await vendor.save();

        // Return vendor without password
        const vendorData = saved.toObject();
        delete vendorData.password;

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: vendorData
        });
    } catch (err) {
        console.error('vendorRegister error:', err && err.stack ? err.stack : err);
        res.status(500).json({ success: false, message: err.message || 'Registration failed', stack: err.stack });
    }
};

// Update Vendor
export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, description } = req.body;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Check if email is being changed and if it's already in use
        if (email && email !== vendor.email) {
            const existingEmail = await Vendor.findOne({ email });
            if (existingEmail) {
                return res.status(409).json({ message: "Email already in use" });
            }
        }

        // Update fields
        if (name) vendor.name = name;
        if (email) vendor.email = email;
        if (phone) vendor.phone = phone;
        if (address) vendor.address = address;
        if (description !== undefined) vendor.description = description;

        const updated = await vendor.save();

        // Return vendor without password
        const vendorData = updated.toObject();
        delete vendorData.password;

        res.json({
            success: true,
            message: "Vendor updated successfully",
            data: vendorData
        });
    } catch (err) {
        console.error('updateVendor error:', err && err.stack ? err.stack : err);
        res.status(500).json({ success: false, message: err.message || 'Failed to update vendor', stack: err.stack });
    }
};

// Delete Vendor
export const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        await Vendor.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Vendor deleted successfully"
        });
    } catch (err) {
        console.error('deleteVendor error:', err && err.stack ? err.stack : err);
        res.status(500).json({ success: false, message: err.message || 'Failed to delete vendor', stack: err.stack });
    }
};

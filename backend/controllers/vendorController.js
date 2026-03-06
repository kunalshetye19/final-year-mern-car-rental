import Vendor from "../models/vendorModel.js";
import Car from "../models/carModel.js";
import Booking from "../models/bookingModel.js";

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

// Get Vendor Income
export const getVendorIncome = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Get all cars owned by this vendor
        const cars = await Car.find({ owner: id }).select('_id');
        const carIds = cars.map(car => car._id);

        // Get all bookings for these cars
        const bookings = await Booking.find({ 'car.id': { $in: carIds } });

        // Calculate income statistics
        let totalIncome = 0;
        let completedIncome = 0;
        let pendingIncome = 0;
        let activeIncome = 0;

        bookings.forEach(booking => {
            const amount = booking.amount || 0;
            totalIncome += amount;

            if (booking.status === 'completed' && booking.paymentStatus === 'paid') {
                completedIncome += amount;
            } else if (booking.paymentStatus === 'pending') {
                pendingIncome += amount;
            } else if (booking.status === 'active' || booking.status === 'upcoming') {
                activeIncome += amount;
            }
        });

        // Get recent bookings (last 5)
        const recentBookings = bookings
            .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
            .slice(0, 5)
            .map(booking => ({
                id: booking._id,
                car: booking.car,
                customer: booking.customer,
                amount: booking.amount,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                bookingDate: booking.bookingDate,
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate
            }));

        res.json({
            success: true,
            data: {
                totalIncome,
                completedIncome,
                pendingIncome,
                activeIncome,
                totalBookings: bookings.length,
                recentBookings
            }
        });
    } catch (err) {
        console.error('getVendorIncome error:', err && err.stack ? err.stack : err);
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch vendor income', stack: err.stack });
    }
};

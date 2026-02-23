import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const vendorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        description: { type: String, default: "" },
        verified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Hash password before saving
vendorSchema.pre('save', async function () {
    try {
        console.log('vendorModel pre-save hook - isModified password:', this.isModified('password'));
    } catch (e) {
        console.log('vendorModel pre-save hook - error checking isModified:', e);
    }
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to compare password
vendorSchema.methods.comparePassword = async function (password) {
    try {
        return await bcryptjs.compare(password, this.password);
    } catch (err) {
        throw err;
    }
};

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;

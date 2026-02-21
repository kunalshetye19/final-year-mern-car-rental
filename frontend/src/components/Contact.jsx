import React, { useState } from "react";
import { contactPageStyles } from "../assets/dummyStyles";
import {
  FaWhatsapp,
  FaEnvelope,
  FaClock,
  FaMapMarkedAlt,
  FaUser,
  FaPhone,
  FaCar,
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";

const bgStyle = {
  backgroundColor: "#0a0a0a",
  backgroundImage: `
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
  `,
  backgroundSize: "40px 40px",
  backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carType: "",
    message: "",
  });

  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (field) => setActiveField(field);
  const handleBlur = () => setActiveField(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage =
      `Name: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Phone: ${formData.phone}%0A` +
      `Car Type: ${formData.carType}%0A` +
      `Message: ${formData.message}`;

    window.open(
      `https://wa.me/919860173503?text=${whatsappMessage}`,
      "_blank"
    );
  };

  return (
    <div
      style={bgStyle}
      className="min-h-screen w-full pt-32 pb-12 px-4 font-sans text-gray-200"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4">
            Contact Our Team
          </h1>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about our premium fleet? Our team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Info */}
          <div className="lg:col-span-4 bg-[#111827]/80 border border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-8">
              <FaMapMarkedAlt className="text-orange-500" />
              Our Information
            </h2>

            <InfoRow
              icon={<FaWhatsapp />}
              title="WhatsApp"
              text="+91 9860173503"
            />
            <InfoRow
              icon={<FaEnvelope />}
              title="Email"
              text="trifittrio333@gmail.com"
            />
            <InfoRow
              icon={<FaClock />}
              title="Hours"
              text="Mon–Sat: 8AM–8PM | Sun: 10AM–6PM"
            />
          </div>

          {/* Right Form */}
          <div className="lg:col-span-8 bg-[#111827]/80 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-6">
              <IoIosSend className="text-orange-500 -rotate-12" />
              Send Your Inquiry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input icon={<FaUser />} name="name" placeholder="Full Name" onChange={handleChange} />
                <Input icon={<FaEnvelope />} name="email" type="email" placeholder="Email" onChange={handleChange} />
                <Input icon={<FaPhone />} name="phone" type="tel" placeholder="Phone" onChange={handleChange} />

                <div>
                  <FaCar className="text-orange-500 mb-2" />
                  <select
                    name="carType"
                    required
                    onChange={handleChange}
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-4 text-white"
                  >
                    <option value="">Select Car Type</option>
                    <option value="Luxury Sedan">Luxury Sedan</option>
                    <option value="SUV">Premium SUV</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>
              </div>

              <textarea
                name="message"
                placeholder="Your message"
                onChange={handleChange}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-4 text-white"
              />

              <button type="submit" className={contactPageStyles.submitButton}>
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */
const InfoRow = ({ icon, title, text }) => (
  <div className="bg-[#1f2937]/50 p-4 rounded-xl flex gap-4 border border-gray-800">
    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-900/20 text-orange-500">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-gray-400">{text}</p>
    </div>
  </div>
);

const Input = ({ icon, ...props }) => (
  <div className="flex flex-col gap-3">
    <span className="text-orange-500">{icon}</span>
    <input
      {...props}
      required
      className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-4 text-white"
    />
  </div>
);

export default Contact;

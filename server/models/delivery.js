const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    origin: {
      type: String,
      default: "Central Sorting Hub",
      trim: true,
    },
    destination: {
      type: String,
      default: "",
      trim: true,
    },
    originLat: {
      type: Number,
      default: null,
    },
    originLng: {
      type: Number,
      default: null,
    },
    postalCode: {
      type: String,
      default: "",
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    volume: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "in_transit", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Delivery", deliverySchema);

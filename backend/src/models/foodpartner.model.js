const mongoose = require('mongoose');

const foodPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    restaurantName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    }
}, { timestamps: true });

// 🟢 Register both 'foodpartner' and 'foodPartner' aliases for Mongoose population
const foodPartnerModel = mongoose.models.foodpartner || mongoose.model("foodpartner", foodPartnerSchema);
if (!mongoose.models.foodPartner) {
    mongoose.model("foodPartner", foodPartnerSchema);
}

module.exports = foodPartnerModel;
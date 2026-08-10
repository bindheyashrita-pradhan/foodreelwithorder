const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    video: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodPartner",
        required: true
    },
    likeCount: {
        type: Number,
        default: 0
    },
    saveCount: {
        type: Number,
        default: 0
    },

    // NEW FIELDS FOR PRICING & QUANTITY
    price: { 
        type: Number, 
        required: true 
    }, // Base Price (e.g. for Regular/Medium)
    category: { 
        type: String, 
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Beverage'], 
        default: 'Veg' 
    },
    portions: {
        small: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        large: { type: Number, default: 0 }
    }
}, { timestamps: true });

const foodModel = mongoose.model("food", foodSchema);

module.exports = foodModel;
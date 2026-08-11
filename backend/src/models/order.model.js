const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true
    },
    portion: {
        type: String, // Fixed: Changed from Number to String for portion names
        required: true
    },
    price: {
        type: Number, // Added missing price field
        required: true
    },
    quantity: {
        type: Number,
        required: true, // Fixed: Corrected typo 'reuired'
        default: 1
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'cancelled'],
        default: 'Pending'
    },
    deliveryAddress: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);
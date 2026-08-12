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
        type: String,
        default: 'Standard'
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    phone: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);
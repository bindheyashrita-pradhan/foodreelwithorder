import mongoose from 'mongoose';


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
        ref: 'foodPartner',
        required: true
    },
    portion: {
        type: Number,
        required: true  // e.g., "Half", "Full", "Per Plate"
    },
    quantity: {
        type: Number,
        reuired: true
    },
    status: {
        type: String,
        enum: [ 'Pending', 'Accepted', 'Rejected', 'Completed', 'cancelled'],
        default: 'Pending'
    },
    deliveryAddress: {
        type: String,
        required: true
    }

},{ timestamps: true });


export default mongoose.model('order', orderSchema);
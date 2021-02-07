const {Schema, model, SchemaTypes} = require('mongoose');

const orderSchema = new Schema({
    courses: [ // массив курсов
        {
            course: {
                type: Object,
                required: true
            },
            count: {
                type: Number,
                required: true
            }
        }
    ],
    user:  // пользователь, который делает заказ
    {
        name: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = model('Order', orderSchema)
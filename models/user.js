const {
    Schema,
    model
} = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date, // время жизни токена
    cart: {
        items: [{
            count: {
                type: Number,
                required: true,
                default: 1
            },
            courseId: {
                type: Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            }
        }]
    }
})

userSchema.methods.addToCart = function (course) {
    const items = [...this.cart.items]; // склонировали массив
    const idx = items.findIndex(c => { // когда курс уже есть в корзине
        return c.courseId.toString() === course._id.toString()
    })

    if (idx >= 0) {
        items[idx].count = items[idx].count + 1;
    } else {
        items.push({
            courseId: course._id,
            count: 1
        })
    }

    this.cart = {
        items
    };
    return this.save();
}

userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items]; // склонировали массив
    const idx = items.findIndex(c => { // когда курс уже есть в корзине
        return c.courseId.toString() === id.toString()
    })

    if (items[idx].count === 1) { // всего один курс в корзине
        items = items.filter(c => c.courseId.toString() !== id.toString()) // удаляем элемент из корзины
    } else {
        items[idx].count--;
    }

    this.cart = {
        items
    };
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = {
        items: []
    };
    return this.save();
}

module.exports = model('User', userSchema)
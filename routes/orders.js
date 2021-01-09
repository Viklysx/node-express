const {
    Router
} = require('express');
const Order = require('../models/order');
const router = Router();

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ // получаем список всех заказов, которые относятся к id пользователя
            'user.userId': req.user._id // если user.userId совпадаеь с req.user._id
        })
        .populate('user.userId');

        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.courses.reduce((total, c) => {
                        return total += c.count * c.course.price
                    }, 0)
                }
            })
        });
    } catch (e) {
        console.log(e)
    }

})

router.post('/', async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(i => ({ // получаем читаемый формат курсов
            count: i.count,
            course: {
                ...i.courseId._doc
            }
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses
        })

        await order.save();
        await req.user.clearCart(); // чистим корзину

        res.redirect('/orders')
    } catch (e) {
        console.log(e)
    }

})

module.exports = router;
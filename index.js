const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session')
const exphbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const varMiddleware = require('./middleware/variables')

const User = require('./models/user');

const hbs = exphbs.create({
    defaultLayout: 'main', 
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
  });

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views'); // указали папку, где хранятся шаблоны

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('5ff8c8af84913f2df0d1db95');
        req.user = user;
        next();
    } catch (e) {
        console.log(e)
    }   
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false
}));
app.use(varMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
async function start() {
    try {
        const url = 'mongodb+srv://sf-st:gt6DP171IDtdFFRG@cluster0.rp1es.mongodb.net/courses_test';
        await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });
        const candidate = await User.findOne(); // если хотя бы один пользователь уже есть, то метод вернет данные
        if (!candidate) {
            const user = new User({
                email: 'vikl@mail.ru',
                name: 'Vika',
                cart: {items: []}
            })
            await user.save();
        }
        app.listen(PORT, () => {
            console.log('Start on port ' + PORT);
        });
    } catch (e) {
        console.log(e)
    }

}

start();
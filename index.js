const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const csrf = require('csurf');
const flash = require('connect-flash');
const express = require('express');
const app = express();
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const exphbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const keys = require('./keys/index')
const errorHandler = require('./middleware/error')
const User = require('./models/user');
const profileRoutes = require('./routes/profile');
const fileMiddleware = require('./middleware/file');
const compression = require('compression');

const hbs = exphbs.create({
    defaultLayout: 'main', 
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers') // созданная новая функция, которую можно использовать в шаблоне
  });

const store = new MongoStore({
    collection: 'sessions', // таблица в БД, где будем хранить все сессии
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views'); // указали папку, где хранятся шаблоны

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(fileMiddleware.single('avatar')); // это подключение должно быть именно здесь, перед csrf и после сессии; avatar - название поля
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use(errorHandler); // важно чтобы это было последним, иначе некоторые роуты могут быть недоступны

const PORT = process.env.PORT || 3000;
async function start() {
    try {
        
        await mongoose.connect(keys.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false
        });
        
        app.listen(PORT, () => {
            console.log('Start on port ' + PORT);
        });
    } catch (e) {
        console.log(e)
    }

}

start();
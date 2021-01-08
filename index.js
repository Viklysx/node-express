const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const mongoose = require('mongoose');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views'); // указали папку, где хранятся шаблоны

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);

const PORT = process.env.PORT || 3000;
async function start() {
    try {
        const url = 'mongodb+srv://sf-st:gt6DP171IDtdFFRG@cluster0.rp1es.mongodb.net/courses_test';
        await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        app.listen(PORT, () => {
            console.log('Start on port ' + PORT);
        });
    } catch (e) {
        console.log(e)
    }

}

start();
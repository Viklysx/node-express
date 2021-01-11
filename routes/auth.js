const {
    Router
} = require('express');
const router = Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const crypto = require('crypto'); // встроенная библиотека nodejs
const resetEmail = require('../emails/reset');

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    }) // уничтожаем сессию

})

router.post('/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        const candidate = await User.findOne({
            email
        });
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true; // в сесии будет храниться true, если залогинились в системе
                req.session.save((err) => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/');
                })
            } else {
                req.flash('loginError', 'Неверный пароль');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            repeat,
            name
        } = req.body;
        const candidate = await User.findOne({
            email
        });
        if (candidate) {
            req.flash('registerError', 'Пользователь уже существует');
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email,
                name,
                password: hashPassword,
                cart: {
                    items: []
                }
            })
            await user.save();
            res.redirect('/auth/login#login');
            await transporter.sendMail(regEmail(email)); // рекомендуется использовать после редиректов
        }
    } catch (e) {
        console.log(e)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) { // если у req.params нет параметра токена
        return res.redirect('/auth/login');
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}// нужно убедиться, что токен все еще валидный
        })
        if (!user) { // если нет такого пользователя
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Восстановить доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }    
    } catch (e) {
        console.log(e)
    }
    
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email}); // для проверки, есть ли такой пользователь
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 3600*1000; // время жизни - 1 час
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'Такой пользователь не найден');
                res.redirect('/auth/reset');
            }
        })
    } catch (e) {
        console.log(e)
    }
})


module.exports = router;
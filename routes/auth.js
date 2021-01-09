const {Router} = require('express');
const router = Router();
const User = require('../models/user')

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    }) // уничтожаем сессию
    
})

router.post('/login', async (req, res) => {
    const user = await User.findById('5ff8c8af84913f2df0d1db95');
    req.session.user = user;
    req.session.isAuthenticated = true; // в сесии будет храниться true, если залогинились в системе
    req.session.save((err) => {
        if (err) {
            throw err
        }
        res.redirect('/');
    })   
})


module.exports = router;
const {Router} = require('express');
const router = Router();

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
    req.session.isAuthenticated = true; // в сесии будет храниться true, если залогинились в системе
    res.redirect('/');
})


module.exports = router;
module.exports = function(req, res, next) {
    if (!req.session.isAuthenticated) { // если незарегистрированный пользователь пытается попасть на защищенные страницы
        return res.redirect('/auth/login')
    }

    next();
}
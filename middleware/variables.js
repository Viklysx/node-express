module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated;

    next(); // вызываем, чтобы продолжить цепочку middleware
}
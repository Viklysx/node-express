module.exports = function(req, res, next) {
    res.status(404).render('404', {
        title: 'страница не найдена'
    }); // задаем статус и рендерим 404 шаблог
}
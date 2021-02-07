const multer = require('multer');
const storage = multer.diskStorage({
    destination(req, file, cb){ // куда складывать данный файл
        cb(null, 'images') // null - сюда передаются ошибки, поэтому пока просто null
    },
    filename(req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname) // второй параметр - это имя файла
    }

});// здесь будем определять, кауда и как сохранять файлы.

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
const fileFilter = (req, file, cb) => {
       if (allowedTypes.includes(file.mimetype)) {
           cb(null, true) // валидация прошла успешно
       } else {
        cb(null, false)
       }
}

module.exports = multer({
    storage,
    fileFilter
});
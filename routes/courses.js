const {
    Router
} = require('express');
const Course = require('../models/course')
const router = Router();
const auth = require('../middleware/auth');

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString() // является ли владельцем человека того курса,который был выбран
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name') // забираем все курсы из БД
            .select('price title img');
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null, // настраиваем права доступа
            courses
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }
});

router.post('/edit', auth, async (req, res) => {
    const {
        id
    } = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        });
    } catch (e) {
        console.log(e)
    }
})

module.exports = router;
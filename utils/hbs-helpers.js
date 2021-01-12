module.exports = {
    ifeq(a, b, options) {// задаем свое название
        if (a == b) {
            return options.fn(this);
        }
        return options.inverse(this);
    } 
}
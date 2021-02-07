const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./keys.prod')
}
else {
    module.exports = require('./keys.dev')
}
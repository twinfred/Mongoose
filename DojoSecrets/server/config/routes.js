const controller = require('./../controllers/controllers')

module.exports = function(app){
    app.get('/', controller.index); // LOGIN / REG PAGE
    app.post('/register', controller.register); // REGISTRATION
    app.post('/login', controller.login); // LOGIN
    app.get('/home', controller.homepage); // HOMEPAGE
    app.post('/add_secret', controller.add_secret); // ADD SECRET
    app.get('/secret/:secret_id', controller.profile); // SECRET PROFILE
    app.post('/add_comment/:secret_id', controller.comment); // ADD COMMENT TO SECRET
    app.get('/secret/:secret_id/delete', controller.delete) // DELETE SECRET
    app.get('/logout', controller.login); // LOGOUT
}
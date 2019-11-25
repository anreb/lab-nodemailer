const passportRouter = require('express').Router();
const passport = require('../config/passport');
const { signupView, signupPost, loginView, confirmAccount } = require('../controllers/auth.controller');
const { catchErrors } = require('../middlewares/catchErrors');

function isNotLoggedIn(req, res, next) {
	!req.isAuthenticated() ? next() : res.redirect('/auth/login');
}

function isLogged(req, res, next) {
	console.log(req.isAuthenticated());
	return req.isAuthenticated() ? next() : res.redirect('/auth/login');
}

passportRouter.get('/signup', signupView);
passportRouter.post('/signup', signupPost);

passportRouter.get('/login', isNotLoggedIn, loginView);
passportRouter.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/auth/login'
	})
);

passportRouter.get('/confirm/:confirmationCode', catchErrors(confirmAccount));

passportRouter.get('/profile-page', isLogged, (req, res) => {
	res.render('auth/profile', { user: req.user });
});

passportRouter.get('/logout', (req, res, next) => {
	req.logout();
	res.redirect('/auth/login');
});

module.exports = passportRouter;

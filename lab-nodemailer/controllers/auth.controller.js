const User = require('../models/User');
const { transporter } = require('./email.controller');

const tokenGen = () => {
	const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let token = '';
	for (let i = 0; i < 25; i++) {
		token += characters[Math.floor(Math.random() * characters.length)];
	}
	return token;
};

exports.signupView = (_, res) => res.render('auth/signup');
exports.signupPost = (req, res) => {
	const { username, password, email } = req.body;
	if (username === '' || password === '') {
		res.render('auth/signup', { message: 'Indicate username and password' });
		return;
	}
	User.findOne({ username }, 'username', (err, user) => {
		if (user !== null) {
			res.render('auth/signup', { message: 'The username already exists' });
			return;
		}
	});
	const token = tokenGen();
	User.register(
		{
			username: username,
			confirmationCode: token,
			email: email
		},
		password
	)
		.then(async () => {
			await transporter.sendMail({
				from: 'B-E team <B-E@gmail.com>',
				to: email,
				subject: 'Click on the link to confirm account',
				text: `Confirm account`,
				html: `
          <a href="http://localhost:3000/auth/confirm/${token}"> Confirmation Code: ${token} </a>`
			});
			res.redirect('/');
		})
		.catch((err) => {
			if (err.email === 'UserExistsError') {
				return res.render('auth/signup', {
					msg: 'Mail already register'
				});
			} else {
				console.log(err);
			}
			res.render('auth/signup', { message: 'Something went wrong' });
		});
};

exports.loginView = async (req, res) => {
	res.render('auth/login', { msg: 'Error' });
};

exports.confirmAccount = async (req, res) => {
	const { confirmationCode } = req.params;
	const user = await User.findOneAndUpdate(
		{ confirmationCode },
		{
			status: 'Active'
		},
		{
			new: true
		}
	);
	res.render('auth/confirmation', { user });
};

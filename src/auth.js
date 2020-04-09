const { Base64 } = require('js-base64');
const chalk = require('chalk');
const jwt = require('jwt-simple');
const passport = require('koa-passport');
const OAuth2Strategy = require('passport-oauth2');

const parseIdToken = (token) => {
	const decoded = Buffer.from(token.split('.')[1], 'base64').toString();
	const { companyId, sub: email, userId } = JSON.parse(decoded);
	return { companyId, email, userId };
};

const verify = (accessToken, refreshToken, params, profile, callback) => {
	// uncomment the next line to see oauth params
	// console.log(`Verifying params ${JSON.stringify(params)}`);
	const { companyId, email, userId } = parseIdToken(params.id_token);
	const user = {
		companyId,
		email,
		userId,
		accessToken,
		refreshToken,
	};
	callback(null, user);
};

const apply = (app) => {
	if (!process.env.APP_HOST) {
		console.log(chalk.yellow('Skipping Tradeshift auth middleware because process.env.APP_HOST is not set'));
		return async (ctx, next) => next();
	}

	const TOKEN_PATH = '/auth/token';
	const REDIRECT_PATH = '/auth/callback';

	passport.serializeUser((user, done) => {
		// uncomment the next line to see user object
		// console.log(`Serializing user ${JSON.stringify(user)}`);
		done(null, jwt.encode(user, process.env.APP_OAUTH_SECRET));
	});
	passport.deserializeUser((id, done) => {
		done(null, jwt.decode(id, process.env.APP_OAUTH_SECRET));
	});

	const apiUrlToAuthUrl = (tsApiHost) => tsApiHost.replace('/tradeshift/rest/external', '/tradeshift/auth');

	const options = {
		authorizationURL: `${apiUrlToAuthUrl(process.env.TS_API_HOST)}/login`,
		tokenURL: `${apiUrlToAuthUrl(process.env.TS_API_HOST)}/token`,
		clientID: process.env.APP_CLIENT_ID,
		clientSecret: process.env.APP_OAUTH_SECRET,
		callbackURL: `${process.env.APP_HOST}${REDIRECT_PATH}`,
		customHeaders: {
			Authorization: `Basic ${Base64.encode(`${process.env.APP_CLIENT_ID}:${process.env.APP_OAUTH_SECRET}`)}`,
		},
	};

	passport.use('tradeshift', new OAuth2Strategy(options, verify));

	app.use(passport.initialize());
	app.use(passport.session());

	return async (ctx, next) => {
		if (ctx.method === 'GET' && ctx.path === TOKEN_PATH) {
			return passport.authenticate('tradeshift', { scope: 'openid offline' })(ctx, next);
		}
		if (ctx.method === 'GET' && ctx.path === REDIRECT_PATH) {
			return passport.authenticate('tradeshift', { successRedirect: '/', failureRedirect: '/' })(ctx, next);
		}
		if (ctx.isUnauthenticated()) {
			return ctx.redirect(TOKEN_PATH);
		}
		console.log(`Request from userId:${ctx.state.user.userId} companyId:${ctx.state.user.companyId}`);
		return next();
	};
};

module.exports = apply;

const error = require('koa-error');
const Koa = require('koa');
const morgan = require('koa-morgan');
const Router = require('koa-router');
const session = require('koa-session');
const views = require('koa-views');
const ts = require('./ts-api');
const auth = require('./auth');

const app = new Koa();
const router = new Router();

// nicer error pages for development
app.use(error());

// create session - needed by passport for authentication
// random key used so oauth dance is performed every time
// TODO: implement refresh token strategy and use a constant key
app.keys = [Math.random().toString().slice(2)];
app.use(session({ sameSite: 'none' }, app));

// hookup middleware for authentication with Tradeshift
app.use(auth(app));

// log HTTP requests
app.use(morgan('dev'));

// template for app served to the browser
app.use(views(__dirname, {
	map: { hbs: 'handlebars' },
	extension: 'hbs',
}));

// single endpoint for the app that serves the view template with a message
router.get('/', async (ctx) => {
	// use this to see app working without connecting to Tradeshift
	// ctx.state.message = 'Hello, world!';

	// use this to see calls to the Tradeshift API working
	const { CompanyName } = await ts.getAccount(ctx);
	ctx.state.message = `Hello developer from ${CompanyName}!`;

	// render the message in the view
	await ctx.render('view');
});

// add routes to the app
app.use(router.routes());

module.exports = app;

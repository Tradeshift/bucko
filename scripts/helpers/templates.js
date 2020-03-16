const DataURI = require('datauri');

const app = ({appId, appUrl, clientSecret, oldVersion }) => ({
	AppId: appId,
	CategoryId: '55539855-574c-4841-5bdb-5a2831601045', // hidden category
	ClientSecret: clientSecret,
	DefaultLocale: 'en-us',
	RedirectUri: appUrl,
	CurrentVersion: oldVersion,
});

const icon = () => (`
	<svg width="176" height="176" viewBox="0 0 176 176" xmlns="http://www.w3.org/2000/svg">
		<g fill="none" fill-rule="evenodd">
			<path
				d="M16.672 176C7.464 176 0 168.536 0 159.328V16.672C0 7.464 7.464 0 16.672 0h142.656C168.536 0 176 7.464 176 16.672v142.656c0 9.208-7.464 16.672-16.672 16.672H16.672z"
				fill="#366375"
				fill-rule="nonzero" />
			<path d="M32.004 32h107.52v107.529H32.004z" />
			<path
				d="M130.56 40.96c-1.452-1.447-3.651-2.124-6.922-2.124-6.55 0-19.394 3.092-27.923 11.626L78.019 68.154h-29.82a4.502 4.502 0 0 0-3.171 1.312l-3.168 3.172a4.489 4.489 0 0 0 0 6.34l50.687 50.682a4.468 4.468 0 0 0 3.168 1.312 4.468 4.468 0 0 0 3.167-1.312l3.172-3.168a4.474 4.474 0 0 0 1.308-3.172V93.497l17.696-17.696c6.442-6.438 9.282-14.753 10.398-19.125.905-3.553 2.63-12.19-.896-15.716zM69.063 77.114l-8.194 8.194-8.198-8.194h16.392zm-1.86 14.533l31.679-31.678 12.67 12.665-31.674 31.682-12.674-12.67zm27.203 27.198l-8.194-8.19 8.194-8.198v16.388zm23.166-52.86L105.53 53.943c6.272-4.404 14.036-6.147 18.108-6.147h.126c.054 3.611-1.626 11.684-6.192 18.19zM67.2 116.99c-2.017 2.012-9.709 3.754-17.267 4.592.856-7.585 2.63-15.304 4.597-17.266 1.156-1.16 2.567-1.895 4.045-2.29l-6.764-6.764c-1.282.753-2.518 1.617-3.616 2.715-6.15 6.155-7.441 24.631-7.638 28.273l-.269 4.982 4.986-.269c3.642-.197 22.118-1.496 28.265-7.643 1.102-1.102 1.962-2.334 2.714-3.62l-6.764-6.769c-.39 1.492-1.125 2.894-2.29 4.06z"
				fill-rule="nonzero"
				fill="#FFF" />
		</g>
	</svg>
`);

const appVersion = ({ appId, appName = appId, appUrl, vendorId, version = '0.0.1' }) => ({
	config: {
		externalurl: true,
	},
	default_locale: 'en-us',
	icons: {
		svg: `${vendorId}.${appId}.svg`,
	},
	manifest_version: '3.0',
	tradeshift_version: '5.0',
	version,
	app_id: appId,
	vendor_id: vendorId,
	app: {
		main: appUrl,
		redirect_uri: `${appUrl}auth/callback`,
	},
	capabilities: {
		access: [
			'group_view',
			'openidconnect',
		],
	},
	backends: {},
	images: {
		[`${vendorId}.${appId}.svg`]: (new DataURI()).format('.svg', icon()).content,
	},
	locales: {
		'en-us': {
			app_desc: `A hand-crafted app from ${vendorId}, with a little help from bucko.`,
			app_name: appName,
		},
	},
});

module.exports = {
	app,
	appVersion,
	icon,
};

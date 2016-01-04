## App Developer Bucko

Friendly assistance to get started developing apps for the Tradeshift platform.

## Setup

Start by running `./bin/setup` to:

* Install git hooks
* Execute `npm install`
* Create a file at `config/oauth.json` for your OAuth secret to be stored

Edit `config/local.json` to define properties of your app, which will override values set in `config/default.json`.

Run `./bin/manifest` to generate a manifest file, which should be sent to Tradeshift to be released to an environment.

Start the NodeJS server by running `npm start`.

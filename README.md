## Bucko

Provides some friendly assistance to get started developing apps on the Tradeshift platform.

## Setup

1. Install dependencies.

    ```bash
    $ npm install
    ```

2. Activate the [Bucko](https://sandbox.tradeshift.com/#/apps/Tradeshift.AppStore/apps/Tradeshift.Bucko) app on Tradeshift to get API credentials.

3. Run the command shown in the Bucko app to setup environment variables.

    ```bash
    $ cat > .env << EOF
    # API credentials for Bucko on Tradeshift
    # https://sandbox.tradeshift.com/#/apps/Tradeshift.Bucko
    TS_API_HOST=<api host>
    TS_COMPANY_ID=<company id>
    TS_CONSUMER_KEY=<consumer key>
    TS_CONSUMER_SECRET=<consumer secret>
    TS_TOKEN=<token>
    TS_TOKEN_SECRET=<token secret>
    EOF
    ```

4. Create an app and release it on Tradeshift.

    ```bash
    $ npm run create-app
    ```

5. Start the server - along with the tunnel - so requests for your app are redirected to your local server.

    ```bash
    $ npm run start-app
    ```

6. Activate your app in Tradeshift (the appstore URL was shown in the output of `npm run create-app`) and you should be able to develop locally and see the changes in Tradeshift.

Happy coding!

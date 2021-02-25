#### even though this is a religious(?) bot:
## in memory of my brother Shamil.

A simple but advanced Bible Bot, which uses getbible.net api to read the whole Bible in 75+ versions inside Telegram. In memory of my brother Shamil ❤️

# bible-bot v3
version 3 of the bible bot. Added a lot of features.

Actually, you can now read the whole Bible inside Telegram in 75+ versions using this bot. It is so damn easy to use the bot. Also, you can change your default version. One more thing: request a reference through message. It will reply!
* Uses getbible.net's api service.
* **Dependencies**: telegraf, firebase, axios, bible-reference-parser, split-array, dotenv.
* **Working demo**: [Scripture Bot](https://telegram.me/scripturbot)

## Deploy
**Actually, no need for a deploying. But incase if you want to:**
Simply deploy the application to heroku by clicking the button below. You will need a **telegram bot token** and your **application's subdomain or the domain** you are using. Read below to find how to get all the values.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/dcdunkan/bible-bot)
* `BOT_TOKEN` : Get this value from [BotFather](https://telegram.me/botfather) on telegram by creating a new bot.
* `BOT_DOMAIN` : Set this value to `<yourappname>.herokuapp.com`. Or if you are using a custom domain, enter it without `https://` or slash `'/'` at the end.
* `FIREBASE` : Set to true if you want to log users in firebase' realtime database. You have to set the other required parameters to activate this features completely.
  **Required Parameters for firebase feature.**
  * `FB_APIKEY` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_AUTHDOMAIN` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_DATABASEURL` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_PROJECTID` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_STORAGEBUCKET` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_MESSAGINGSENDERID` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.
  * `FB_APPID` : ONLY NEEDED IF `FIREBASE` IS SET TO TRUE. Get this value while creating a firebase app.

**The firebase project parameters should look like**
``` javascript
var firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "myapp-project-123.firebaseapp.com",
  databaseURL: "https://myapp-project-123.firebaseio.com",
  projectId: "myapp-project-123",
  storageBucket: "myapp-project-123.appspot.com",
  messagingSenderId: "65211879809",
  appId: "1:65211879909:web:3ae38ef1cdcb2e01fe5f0c",
  measurementId: "G-8GSGZQ44ST"
};
```
Get the required values from there.

## Contribute
Open an issue, pull a request or fork and do your own. But please ⭐ star the repo if you liked it.

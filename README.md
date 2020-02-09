# Logging/Bot for strims.gg chat mentions
Source code for the mentions bot/logger on strims.gg

### Install node.js
Visit https://nodejs.org/ and install the package to
be able to use npm

#### Install the node dependencies

```bash
$ npm install
```
### Config

Config is located at `./src/config.json`  
  
Change the `jwt_token` key to your jwt token.

### Running
You will have to run the logger and bot in seperate terminals.
```
$ node logger
```
and
```
$ node bot
```

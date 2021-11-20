# twitch-eventsub-public

Link to Twitch EventSub docs: [https://dev.twitch.tv/docs/eventsub](https://dev.twitch.tv/docs/eventsub).

### How to

```bash
yarn install # or npm install
```

**Rename .env.example to .env**

Then fill out the following variables:

```bash
# Twitch
twitch_clientID=       # Your application Twitch ClientID - usually your app/bot's ClientID
twitch_token=          # Your application Twitch token generated from the OAuth flow
twitch_webhook_secret= # Part of EventSub setup - 10 to 100 character secret
twitch_channel=        # Your Twitch channel here

# Express
port=                  # Express port - change this. Default is 4002

# Discord
discordUrl=            # Webhook URL for the Discord channel to post to
discordRoleId=         # Used if you post to a specific role (example: @Twitch Ping). Delete this if you're just using @everyone
```

### Running it

```bash
yarn start # or npm run start
```

I can personally recommend setting this up with something like Supervisor.

The config I've used looks like this:

```bash
[program:twitch-eventsub]
command = yarn run start
directory = /home/arky/twitch-eventsub/
user = arky
autostart = true
autorestart = true
stopasgroup = true # Important
killasgroup = true # Important
stdout_logfile = /var/log/supervisor/twitchbot-eventsub.log
stderr_logfile = /var/log/supervisor/twitchbot-eventsub_err.log
```

Minimum required [Node.js](https://nodejs.org) version: 14.x

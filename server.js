/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import axios from 'axios'
import express from 'express'
import requirejs from 'requirejs'

import { twitchapi } from './helpers/twitch'

// requirejs because crypto is a bitch
const crypto = requirejs('crypto')


// This is the secret you used when you set up the EventSub.
// As per docs, it has to be between 10 and 100 characters
const twitchSigningSecret = process.env.twitch_webhook_secret

// Setting up Express
const app = express()
const port = process.env.port || 4002

// Verifying the signatures from Twitch as per docs:
// https://dev.twitch.tv/docs/eventsub/handling-webhook-events#verifying-the-event-message
const verifySignature = (req, res, buf, encoding) => {
    const messageId = req.header("Twitch-Eventsub-Message-Id")
    const timestamp = req.header("Twitch-Eventsub-Message-Timestamp")
    const messageSignature = req.header("Twitch-Eventsub-Message-Signature")
    const time = Math.floor(new Date().getTime() / 1000)

    // Check if the timestamp is older than 10 minutes
    // Otherwise Twitch sets your EventSub status to failed, and you'll have to redo the subscription
    if(Math.abs(time - timestamp) > 600) {
        console.log(`verifySignature: Verification failed > 10 minutes for message ID: ${messageId}`)
    }

    // Check if secret is set
    if(!twitchSigningSecret) {
        console.log(`verifySignature: Twitch signing secret empty`)
    }

    // Calculate signature
    const computedSignature = `sha256=${crypto
    .createHmac("sha256", twitchSigningSecret)
    .update(messageId + timestamp + buf)
    .digest("hex")}`

    // Check if signature is valid
    if(messageSignature !== computedSignature) {
        console.log(`verifySignature: Invalid signature`)
    } else {
        console.log(`verifySignature: Verification successful`)
    }
}

// Express allows us to use our verifySignature function every time we get a request.
app.use(express.json({ verify: verifySignature }))
app.use(express.urlencoded({ extended: true }))
app.disable('x-powered-by')

// The callback URL for the EventSub in my example is set to https://twitch.arky.dk/stream
// So when there's a post request from Twitch to this URL, do something...
app.post('/stream', async (req, res) => {
    const { type } = req.body.subscription
    const messageType = req.header("Twitch-Eventsub-Message-Type")

    // Fallback to when an EventSub is set up.
    // For an EventSub not to fail, you'll need to send a 200 back to Twitch
    // As per docs: https://dev.twitch.tv/docs/eventsub/handling-webhook-events#responding-to-a-challenge-request
    if(messageType === "webhook_callback_verification") {
        return res.status(200).send(req.body.challenge)
    }

    // React when stream goes online
    if (type === "stream.online") {
        // Get stream info because EventSub lacks any kind of information about the streamer
        await twitchapi.get(`/streams?user_login=${process.env.twitch_channel}`)
        .then((dataFromTwitch) => {
            const data = JSON.stringify(dataFromTwitch.data.data)
            const stream = JSON.parse(data)

            // Setting thumbnail width/height. These can customized to your liking.
            const thumbnailWidth = 400
            const thumbnailHeight = 225

            // axios.post request with Discord embed.
            // Make your own at https://leovoel.github.io/embed-visualizer/
            // Variables notable here:
            // `webhookUrl`: webhook URL for the channel you want to post in - eg #stream-announcements
            // `discordRoleId`: this is to ping a role. If you don't want this part, for example if you ping @everyone, then remove this
            axios({
                method: 'POST',
                url: process.env.webhookUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "content": `<@&${process.env.discordRoleId}> Arky is live on Twitch! https://twitch.tv/${stream[0].user_login}`,
                    "embeds": [{
                        "title": stream[0].user_name,
                        "description": stream[0].title,
                        "url": `https://twitch.tv/${stream[0].user_login}`,
                        "color": 4886754,
                        "fields": [{
                            "name": "Playing",
                            "value": stream[0].game_name,
                            "inline": true
                        }],
                        "image": {
                            "url": stream[0].thumbnail_url.replace('{width}', thumbnailWidth).replace('{height}', thumbnailHeight)
                        },
                        "timestamp": stream[0].started_at,
                        "footer": {
                            "text": `https://twitch.tv/${stream[0].user_login}`,
                            "icon_url": "https://i.imgur.com/EuuwUKf.png"
                        }
                    }]
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    res.status(200).end()
})

// Boot Express
const listener = app.listen(port, () => {
    console.log(`Twitch Eventsub: App is listening on ${port}`)
})

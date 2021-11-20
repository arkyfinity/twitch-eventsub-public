// Helper for Twitch API
// Usage: twitchapi.get('url', () => {})
// This way you have access to promise-based requests

import axios from 'axios'

const clientID = process.env.twitch_clientID
const token = process.env.twitch_token

export const twitchapi = axios.create({
    baseURL: 'https://api.twitch.tv/helix',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': clientID
    }
})

export default twitchapi

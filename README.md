# KrakenCommand

KrakenCommand is the brains of my `wled` lighting setup. Nothing too interesting going on.

## Installation

Make an `.env` file , and add the following text:
```
#Client ID
CLIENTID=''

#oAuth
# channel:manage:redemptions channel:read:redemptions user:read:email chat:edit chat:read channel_editor
OAUTH=''

TWITCHUSER='riekelt'
```
For more information what to fill in here, check [ComfyJS instructions](https://github.com/instafluff/ComfyJS#sending-chat-messages)
`TWITCHUSER` is the channelname, I've filled in my own twitch name.
`OAUTH` needs [Tokengen](https://twitchapps.com/tokengen/). Use the whole string (minus `#`) of things for this to work

Also create the colors folder and create `body.txt` and `eyes.txt`.

##Usage

Either throw open a CLI in the folder and `node .`, or use the .exe I'd made myself.

## Contributing
Ideas and original Squid RGB Lamp by [Alecat](https://twitter.com/alecatmew)

Powered by [Comfyjs by Instafluff](https://github.com/instafluff/ComfyJS)

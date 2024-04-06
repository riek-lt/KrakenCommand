//pkg index.js --output livesquid
const LiveSplitClient = require('livesplit-client');
const request = require('request');
const colors = require('./colors/colors');
const fs = require('fs');

var ComfyJS = require("comfy.js");
ComfyJS.Init(process.env.TWITCHUSER, process.env.OAUTH);

var colorChoice;
const eyesJSON = "colors/eyes.txt";
const bodyJSON = "colors/body.txt";

var lastBodyColor = readData(bodyJSON);
var lastEyesColor = readData(eyesJSON);



(async () => {
    try {
        // Initialize client with LiveSplit Server's IP:PORT
        const client = new LiveSplitClient('127.0.0.1:16834');

        // Connected event
        client.on('connected', () => {
            console.log('Connected!');
        });

        // Disconnected event
        client.on('disconnected', () => {
            console.log('Disconnected!');
        });

        // Error event
        client.on('error', (err) => {
            console.log(err);
        });

        // Some async sleep sugar for this example
        const sleep = (time) => {
            return new Promise((r) => {
                setTimeout(() => r(), time);
            });
        };

        // Connect to the server, Promise will be resolved when the connection will be succesfully established
        await client.connect();

        let previousSplitName = '';

        // Function to check split name every 2000ms
        setInterval(async () => {
            try {
                // Get current split name
                const currentSplitName = await client.getCurrentSplitName();

                // Check if split name has changed
                if (currentSplitName !== previousSplitName) {
                    // Display split name and delta
                    const delta = await client.getDelta();
                    console.log(`Split Name: ${currentSplitName}, Delta: ${delta}`);
                    // Update previous split name
                    previousSplitName = currentSplitName;
                    const info = await client.getAll();
					
					//TODO: Distinguish between red and green
					
                    sendPost(colors.greenBody, "none");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 2000);

        await client.getDelta();


    } catch (err) {
        console.error(err); // Something went wrong
    }
})();

function sendPost(input, segment) {
    request.post({
        url: "http://192.168.2.31/json/state",
        headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
        },
        body: input
    }, (error, response, body) => {
        if (error) {
            console.error('Error:', error);
        } else if (response.statusCode !== 200) {
            console.error('Error:', body);
        } else {
            switch (segment) {
                case "body":
                    writeText(bodyJSON, input);
                    break;
                case "eyes":
                    writeText(eyesJSON, input);
                    break;
            }
        }
    });
}

ComfyJS.onReward = (user, reward, cost, message, extra) => { //https://github.com/instafluff/ComfyJS?tab=readme-ov-file
    if (reward === "Squid eyes color") {
            switch (message) {
                case "white":
                    colorChoice = colors.whiteEyes;
                    break;
                case "green":
                    colorChoice = colors.greenEyes;
                    break;
                case "off":
                    colorChoice = colors.blackEyes;
                    break;
                case "red":
                    colorChoice = colors.redEyes;
                    break;
                case "magenta":
                    colorChoice = colors.magentaEyes;
                    break;
            }
            sendPost(colorChoice, 'eyes');
            lastEyesColor = colorChoice;
        }
        if (reward === "Squid color") {
            switch (message) {
                case "red":
                    colorChoice = colors.redBody;
                    break;
                case "blue":
                    colorChoice = colors.blueBody;
                    break;
                case "green":
                    colorChoice = colors.greenBody;
                    break;
                case "white":
                    colorChoice = colors.whiteBody;
                    break;
                case "yellow":
                    colorChoice = colors.yellowBody;
                    break;
                case "orange":
                    colorChoice = colors.orangeBody;
                    break;
                case "magenta":
                    colorChoice = colors.magentaBody;
                    break;
                case "off":
                    colorChoice = colors.blackBody;
                    break;
                case "cyan":
                    colorChoice = colors.cyanBody;
                    break;
            }
            sendPost(colorChoice, 'body');
            lastBodyColor = colorChoice;
        }
    }


function readData(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
        } else {
            return data;
        }
    });
}

function writeText(dest, content) {
    fs.writeFileSync(dest, content, (err) => {
        if (err) throw err;
    });
}
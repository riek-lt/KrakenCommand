//pkg index.js --output livesquid
const LiveSplitClient = require('livesplit-client');
const request = require('request');
const colors = require('./colors/colors');
const fs = require('fs');
require('dotenv').config();

var ComfyJS = require("comfy.js");
ComfyJS.Init('riekelt', process.env.OAUTH);

var colorChoice;
const eyesJSON = "colors/eyes.txt";
const bodyJSON = "colors/body.txt";

var prevTime = "-0.00";
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
                const currentTimerPhase = await client.getCurrentTimerPhase();
                // Check if split name has changed
                if (currentSplitName !== previousSplitName) {
                    //See iff 
                    if (currentTimerPhase == "Running") {
                        // Display split name and delta
                        const delta = await client.getDelta();
                        console.log(`Split Name: ${currentSplitName}, Delta: ${delta}`);
                        // Update previous split name
                        previousSplitName = currentSplitName;

                        const info = await client.getDelta();
                        livesplitSignaler(paceChecker(info, prevTime));

                        prevTime = info;
                        console.log('---------------------------------------------------------');
                    } else {
                        prevTime = "-0.00"
                    }
                }
            } catch (error) {
                console.error('Livesplit block Error:', error);
            }
        }, 5000);

        await client.getDelta();


    } catch (err) {
        console.error("end of interval: " + err); // Something went wrong
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
            console.error('sendPost Error:', error);
        } else if (response.statusCode !== 200) {
            console.error('Sendpost not 200 Error:', body);
        } else {
            switch (segment) {
                case "body":
                    writeText(bodyJSON, input);
                    break;
                case "eyes":
                    writeText(eyesJSON, input);
                    break;
                default:

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

ComfyJS.onChat = (user, message, flags, self, extra) => {
    if (user === "Riekelt") {
        if (message === "party mode") {
            sendPost(colors.partyMode, 'none');
            setTimeout(function() {
                sendPost(lastBodyColor, 'body');
                sendPost(lastEyesColor, 'eyes');
            }, 5000);
        } else if (message === "full red") {
            sendPost(colors.redBody, 'body');
            sendPost(colors.redEyes, 'eyes');
        }
    } else {}
}

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  console.log(user + ' subbed for months ' + subTierInfo + ' + ' + extra);
  sendPost(colors.partyMode, 'none');
  setTimeout(function() {
    sendPost(lastBodyColor, 'body');
    sendPost(lastEyesColor, 'eyes');

  }, 10000);
}

ComfyJS.onRaid = (user, viewers, extra) => {
  sendPost(colors.partyMode, 'none');
  setTimeout(function() {
    sendPost(lastBodyColor, 'body');
    sendPost(lastEyesColor, 'eyes');
  }, 10000);
}

function livesplitSignaler(signal) {
    if (signal == "red") {
        sendPost(colors.liveRed, "none")
    } else if (signal == "green") {
        sendPost(colors.liveGreen, "none")
    }
    setTimeout(function() {
        sendPost(lastBodyColor, 'body');
        //    sendPost(lastEyesColor, 'eyes');
    }, 3000);
}

function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        console.error(err);
    }
}

function writeText(dest, content) {
    fs.writeFileSync(dest, content, (err) => {
        if (err) throw err;
    });
}

function paceChecker(currentTime, prevTime) {
    const currentSeconds = timeParser(currentTime);
    const prevSeconds = timeParser(String(prevTime));
    const plusMinusCurrent = getPlusMinus(currentTime);
    const plusMinusPrev = getPlusMinus(prevTime);


    if ((currentTime !== undefined) || (prevTime !== undefined)) {
        if ((plusMinusCurrent == '+') && (plusMinusPrev == "−")) {
            console.log("I DID A 1 red");
            return "red";
        } else if ((plusMinusCurrent == '−') && (plusMinusPrev == "−")) {
            if (currentSeconds - prevSeconds > 0) {
                console.log("I DID A 2 green");
                return "green";
            } else {
                console.log("I DID A 3 red");
                return "red";
            }
        } else if ((plusMinusCurrent == '−') && (plusMinusPrev == "+")) {
            console.log("I DID A 4 green");
            return "green";
        } else if ((plusMinusCurrent == '+') && (plusMinusPrev == "+")) {
            if (currentSeconds - prevSeconds > 0) {
                console.log("I DID A 5 red");
                return "red";
            } else {
                console.log("I DID A 6 green");
                return "green";
            }
        }
    } else {
        return "none";
    }
}

function timeParser(time) {
    if ((time.includes('+')) || (time.includes('−'))) {
        var seconds = parseFloat('0.0');
        time = time.substring(1)
        if (time.includes(":")) {
            var minuteGetter = time.split(":");
            time = minuteGetter[1]
            seconds += parseFloat(minuteGetter[0]) * 60;
        }
        seconds += parseFloat(time);
        return seconds;
    }
}

function getPlusMinus(time) {
    if ((time.includes('−')) || (time.includes('+'))) {
        const plusminus = time.charAt(0);
        return plusminus
    }
}
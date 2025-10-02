//pkg -t node*-win-x64 index.js --output livesquid
//pkg index.js --output livesquid
const net = require('net');
const request = require('request');
const colors = require('./colors/colors');
const fs = require('fs');
require('dotenv').config();

//Integration of comfyjs is wonky and manual. See ComfyJS and limiter-async in node_modules
var ComfyJS = require("comfy.js");
ComfyJS.Init('riekelt', process.env.OAUTH);

var colorChoice;
var prevTime = "-0.00";

//Load last colour into memory
const eyesJSON = "colors/eyes.txt";
const bodyJSON = "colors/body.txt";
var lastBodyColor = readData(bodyJSON);
var lastEyesColor = readData(eyesJSON);

var prevBPT, currentBPT;
var splitIndex = 0;
const HOST = '127.0.0.1'; // or the server IP
const PORT = 16834;


const client = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log(`Connected to ${HOST}:${PORT}`);

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

    let previousSplitName = '';

    // Function to check split name every 1000ms
    setInterval(async () => {
        try {
            // Get current split name and phase (running?)
            const currentSplitName = await sendCommand('getcurrentsplitname');
            const currentTimerPhase = await sendCommand('getcurrenttimerphase');

            // Check if split name has changed
            if (currentSplitName !== previousSplitName) {
                //See if timer is running. If so do stuff.
                if (currentTimerPhase == "Running") {
                    // Display split name and delta
                    var delta = await sendCommand('getdelta');
                    console.info(`Split Name: ${currentSplitName}, Delta: ${delta}`);
                    // Update previous split name
                    previousSplitName = currentSplitName;

                    //Save Delta, split number and BPT for gold, then give signals to lamp.
                    var info = await sendCommand('getdelta');
                    info = removeZeroes(info);
                    splitIndex = await sendCommand('getsplitindex');
                    currentBPT = await sendCommand('getbestpossibletime');
                    currentBPT = removeZeroes(currentBPT);
                    livesplitSignaler(paceChecker(info, prevTime));

                    //Save time for new comparison
                    prevTime = info;
                    console.log('---------------------------------------------------------');
                } else {
                    // If timer is not running, reset last time to 0.
                    prevTime = "-0.00"
                }
            }
        } catch (error) {
            console.error('Livesplit block Error:', error);
        }
    }, 2000);

});

//Function for sending the API calls to the squid.
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
                //If second arg is body or eyes, save that string to files to remember what was last.
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

//Function for the rewards.
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

// //currently only used for testing to not be reliant on rewards.
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

// //New sub enables party mode for 10 secs, then reverts
// //"none" means I'm not saving to eyes/body. Could be any word like banana
ComfyJS.onSub = (user, message, subTierInfo, extra) => {
    console.log(user + ' subbed for months ' + subTierInfo + ' + ' + extra);
    sendPost(colors.partyMode, 'none');
    setTimeout(function() {
        sendPost(lastBodyColor, 'body');
        sendPost(lastEyesColor, 'eyes');

    }, 10000);
}

// //Raids enable party mode for 10 seconds, then reverts
ComfyJS.onRaid = (user, viewers, extra) => {
    sendPost(colors.partyMode, 'none');
    setTimeout(function() {
        sendPost(lastBodyColor, 'body');
        sendPost(lastEyesColor, 'eyes');
    }, 10000);
}

//This function gets the colour the squid needs to be, and sends this as an API request.
function livesplitSignaler(signal) {
    //Triggers if BPT dropped, this means I golded. This is more important to check.
    //Could probably be nested around the green signal instead of here.
    if (isGold()) {
        //Unsure why this check is here.
        if (splitIndex > 0) {
            sendPost(colors.liveGold, "none")
            console.log("SENT GOLD")
        }
    } else {
        if (signal == "red") {
            sendPost(colors.liveRed, "none")
        } else if (signal == "green") {
            sendPost(colors.liveGreen, "none")
        }
    }
    setTimeout(function () {
        //After 5 seconds, return body. Since livesquid only affects the body, only this needs to be reset.
        sendPost(lastBodyColor, 'none');
        sendPost(lastEyesColor, 'none');
    }, 5000);
}

//This function reads data from text files and returns it.
function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        console.error(err);
    }
}

//Writes body/eyes to text file.
function writeText(dest, content) {
    fs.writeFileSync(dest, content, (err) => {
        if (err) throw err;
    });
}

//This gets 2 livesplit values (ie "+2:55:21.22)" and compares the difference.
function paceChecker(currentTime, prevTime) {
    //Convert the string to seconds as a float (142.65 for 2:22.65)
    const currentSeconds = timeParser(currentTime);
    const prevSeconds = timeParser(String(prevTime));
    //Saves the +/- if I'm behind or not. Needed for comparison.
    const plusMinusCurrent = getPlusMinus(currentTime);
    const plusMinusPrev = getPlusMinus(prevTime);

    //The next part compares the 2 times and judges whether I lost or gained time and returns green or red.
    //Only works if both aren't undefined. Doesn't work for the first split, need to look into that.
    if ((currentTime !== undefined) || (prevTime !== undefined)) {
        //If went from - to +, this 100% means I lost time
        if ((plusMinusCurrent == '+') && (plusMinusPrev == "-")) {
            console.info("I DID A 1 red (ez)");	//Cannot trigger this weirdly4444.0.
            return "red";
        } else if ((plusMinusCurrent == '-') && (plusMinusPrev == "-")) {
            //If I stayed on - on both times, I can easily subtract current from prev. If positive, I gained time
            //Likewise, if negative, it means I lost time. 
            if (currentSeconds - prevSeconds > 0) {
                console.info("I DID A 2 green");
                return "green";
            } else {
                console.info("I DID A 3 red");
                return "red";
            }
            //Opposite logic from up here.
        } else if ((plusMinusCurrent == '-') && (plusMinusPrev == "+")) {
            console.info("I DID A 4 green (ez)");
            return "green";
        } else if ((plusMinusCurrent == '+') && (plusMinusPrev == "+")) {
            if (currentSeconds - prevSeconds > 0) {
                console.info("I DID A 5 red");
                return "red";
            } else {
                console.info("I DID A 6 green");
                return "green";
            }
        }
    } else {
        return "none";
        console.log('one of the parameters was undefined. Probably prevTime ' + prevTime);
    }
}

//This function accepts a time format "+2:22:22.22" or "-11:11.11" and returns this in seconds (float) (671.11)
function timeParser(time) {
    //Only works if string has a + or -. Makes things easier
    if ((time.includes('+')) || (time.includes('-'))) {
        var seconds = parseFloat('0.0');
        //Get rid of plus or minus for calcs
        time = time.substring(1)
        //If string has :, it at least has minutes added to it!
        if (time.includes(":")) {
            //Make array split by hours (opt), minutes and (milli)seconds.
            var minuteGetter = time.split(":");
            //If this is true, we got hours in the string.
            if (minuteGetter.length == 3) {
                //Add hours in seconds, then get rid of index 0 so it's minutes and seconds left.
                seconds += parseFloat(minuteGetter[0]) * 60 * 60;
                minuteGetter = minuteGetter.slice(1);
            }
            //Make time just seconds, then add minutes to seconds counter
            time = minuteGetter[1]
            seconds += parseFloat(minuteGetter[0]) * 60;
        }
        //Add seconds to total and return. Conversion might not be needed anymore.
        seconds += parseFloat(time);
        return seconds;
    }
}

//Returns if it's a + or - at the start of a string. Input is "+2:22:22.22"
function getPlusMinus(time) {
    if ((time.includes('-')) || (time.includes('+'))) {
        const plusminus = time.charAt(0);
        return plusminus
    } else {
        console.log("INVALID PLUSMINUS")
    }
}

//If the Best Possible Time changed this split, I golded. 
function isGold() {
    if (timeParser("+" + currentBPT) < timeParser("+" + prevBPT)) {
        console.info("We golded with " + (timeParser("+" + prevBPT) - timeParser("+" + currentBPT)).toFixed(2) + "!");
        prevBPT = currentBPT;
        return true;
    } else {
        //This is for initialisation?
        prevBPT = currentBPT;
        return false;
    }
}
let pendingResolver = null;

function sendCommand(cmd) {
    return new Promise((resolve, reject) => {
        if (pendingResolver) {
            return reject(new Error('Another command is still pending!'));
        }
        pendingResolver = resolve;
        client.write(cmd + '\n');
    });
}


client.on('data', (data) => {
    const response = data.toString().trim();

    if (pendingResolver) {
        pendingResolver(response);
        pendingResolver = null;
    } else {
        console.log('Server says (unsolicited):', response);
    }
});

function removeZeroes(data) {
    //Get rid of all the zeroes first
    for (var i = 0; i < 2; i++) {
        data = data.replace("00:", "");
    }
    //If we're not behind, we're ahead. Adds a plus at this stage.
    //Previous logic worked this way, so it's safer to preserve that than to rewrite everything.
    if ((data.charAt(0) !== "-") || (data.charAt(0) == "+")) {
        data = "+" + data;
    }
    //We don't need that many numbers behind the comma
    data = data.substr(0, data.length - 5);
    //If the first number is a 0, please remove
    if (data.charAt(1) == "0") {
        data = data.slice(0, 1) + data.slice(2);
    }
    return data;
}
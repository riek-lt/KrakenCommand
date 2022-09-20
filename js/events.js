var lastBodyColor = blackBody;
var lastEyesColor = blackEyes;

var colorChoice;

ComfyJS.onReward = (user, reward, cost, message, extra) => {
  if (reward === "Squid eyes color") {
    switch (message) {
      case "white":
        colorChoice = whiteEyes;
        break;
      case "green":
        colorChoice = greenEyes;
        break;
      case "off":
        colorChoice = blackEyes;
        break;
      case "red":
        colorChoice = redEyes;
        break;
    }
    sendPost(colorChoice);
    lastEyesColor = colorChoice;
  }
  if (reward === "Squid color") {
    switch (message) {
      case "red":
        colorChoice = redBody;
        break;
      case "blue":
        colorChoice = blueBody;
        break;
      case "green":
        colorChoice = greenBody;
        break;
      case "yellow":
        colorChoice = yellowBody;
        break;
      case "orange":
        colorChoice = orangeBody;
        break;
      case "magenta":
        colorChoice = magentaBody;
        break;
      case "off":
        colorChoice = blackBody;
        break;
      case "cyan":
        colorChoice = cyanBody;
        break;
    }
    sendPost(colorChoice);
    lastBodyColor = colorChoice;
  }
}

ComfyJS.onChat = (user, message, flags, self, extra) => {
  if (user === "Riekelt") {
    if (message === "test") {
      console.log('done');
      sendPost(partyMode);
      setTimeout(function() {
        sendPost(lastBodyColor);
        sendPost(lastEyesColor);
      }, 5000);
    } else if (message === "full red") {
      sendPost(redBody);
      sendPost(redEyes);
    }
  } else {
    console.log("no can do");
  }
}

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  sendPost(partyMode);
  setTimeout(function() {
    sendPost(lastBodyColor);
  }, 10000);
}

ComfyJS.onRaid = (user, viewers, extra) => {
  sendPost(partyMode);
  setTimeout(function() {
    sendPost(lastBodyColor);
  }, 5000);
}

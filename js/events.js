var lastBodyColor = blackBody;
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
  if (message === "test") {
    sendPost(rainbowBody);
    setTimeout(function() {
      sendPost(lastBodyColor);
    }, 5000);
  }
}

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  sendPost(rainbowBody);
  setTimeout(function() {
    sendPost(lastBodyColor);
  }, 10000);
}

ComfyJS.onRaid = (user, viewers, extra) => {
  sendPost(rainbowBody);
  setTimeout(function() {
    sendPost(lastBodyColor);
  }, 5000);
}

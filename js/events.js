ComfyJS.onReward = (user, reward, cost, message, extra) => {
  if (reward === "Squid color") {
    switch (message) {
      case "red":
        sendPost(redBody);
        break;
      case "blue":
        sendPost(blueBody);
        break;
      case "green":
        sendPost(greenBody);
        break;
      case "yellow":
        sendPost(yellowBody);
        break;
      case "orange":
        sendPost(orangeBody);
        break;
      case "magenta":
        sendPost(magentaBody);
        break;
      case "off":
        sendPost(blackBody);
        break;
      case "cyan":
        sendPost(cyanBody);
        break;
    }
  }
}

ComfyJS.onReward = (user, reward, cost, message, extra) => {
  if (reward === "Squid eyes color") {
    switch (message) {
      case "white":
        sendPost(whiteEyes);
        break;
      case "green":
        sendPost(greenEyes);
        break;
      case "off":
        sendPost(blackEyes);
        break;
      case "red":
        sendPost(redEyes);
        break;
    }
  }
}

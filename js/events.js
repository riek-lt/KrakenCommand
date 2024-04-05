
var lastBodyColor = localStorage.getItem('body')
var lastEyesColor = localStorage.getItem('eyes');

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
	  case "magenta":
        colorChoice = magentaEyes;
        break;
    }
    sendPost(colorChoice, 'eyes');
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
	  case "white":
	    colorChoice = whiteBody;
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
    sendPost(colorChoice, 'body');
    lastBodyColor = colorChoice;
  }
}

ComfyJS.onChat = (user, message, flags, self, extra) => {
  if (user === "Riekelt") {
    if (message === "party mode") {
      console.log('done');
      sendPost(partyMode, 'none');
      setTimeout(function() {
        sendPost(lastBodyColor, 'body');
        sendPost(lastEyesColor, 'eyes');
      }, 5000);
    } else if (message === "full red") {
      sendPost(redBody, 'body');
      sendPost(redEyes, 'eyes');
    }
  } else {
    console.log("no can do");
  }
}

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  console.log(user + ' subbed for months ' + subTierInfo + ' + ' + extra);
  sendPost(partyMode, 'none');
  setTimeout(function() {
    sendPost(lastBodyColor, 'body');
    sendPost(lastEyesColor, 'eyes');

  }, 10000);
}

ComfyJS.onRaid = (user, viewers, extra) => {
  sendPost(partyMode, 'none');
  setTimeout(function() {
    sendPost(lastBodyColor, 'body');
    sendPost(lastEyesColor, 'eyes');
  }, 10000);
}

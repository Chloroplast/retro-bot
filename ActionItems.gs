function addNewActionItem(slackMessage){
  parsedMessage = slackMessage.split("add")[1];
  messageParsedForAssignedUser = parsedMessage.split("<");
  
  var assignedUserName = "Unassigned";
  var assignedUserID = "Unassigned";
  
  
  if (messageParsedForAssignedUser[1] && messageParsedForAssignedUser[1] != ""){ 
    assignedUserName = getUserName(messageParsedForAssignedUser[1]);
    
    assignedUserID = "<" + parseOutSpaces(messageParsedForAssignedUser[1]);
    
    for (var i = 2; i < messageParsedForAssignedUser.length; i++){
      assignedUserName += ", " + getUserName(messageParsedForAssignedUser[i]);
      assignedUserID += ", <" + parseOutSpaces(messageParsedForAssignedUser[i]);
    }
  }
  
  ACTION_ITEM_SHEET.appendRow([messageParsedForAssignedUser[0], assignedUserID, assignedUserName]);
}

function assignActionItem(slackMessage){
  var messageWithoutDuplicateSpaces = slackMessage.replace( /\s\s+/g, ' ' );
  var parsedMessage = messageWithoutDuplicateSpaces.split(" ");
  
  var actionItemIndex = parsedMessage[2];
  var assignedToUserID = parsedMessage[4];
  var assignedToUserName = getUserName(parsedMessage[4]);
 
  ACTION_ITEM_SHEET.getRange(actionItemIndex, 2).setValue(assignedToUserID);
  ACTION_ITEM_SHEET.getRange(actionItemIndex, 3).setValue(assignedToUserName);
}

function markActionItemAsCompleted(slackMessage){
  messageWithoutDuplicateSpaces = slackMessage.replace( /\s\s+/g, ' ');
  var parsedMessage = messageWithoutDuplicateSpaces.split(" ");
  
  var actionItemIndex = parsedMessage[2];
 
  ACTION_ITEM_SHEET.getRange(actionItemIndex, 4).setValue("DONE");
}

function handleShowActionItems(messageArray, postChannel, user){
  if (messageArray.length < 3) {
    var suggestion = "If you are trying to display action items, try %60show all%60 or %60show my%60";
    postCommandNotFoundMessageWithSuggestion(suggestion, postChannel);
    return;
  }
  if (messageArray[2].toLowerCase() === "my" || messageArray[2].toLowerCase() === "mine") {
    postOneUsersActionItems(postChannel, user);
  }
  else if (messageArray[2].toLowerCase() === "team") {
    postOneTeamsActionItems(postChannel, messageArray[3]);
  }
  else if (messageArray[2].toLowerCase() === "all") {
    postAllActionItems(postChannel);
  }
  else {
    var suggestion = "If you are trying to display action items, try %60show all%60 or %60show my%60";
    postCommandNotFoundMessageWithSuggestion(suggestion, postChannel);
  }
}

function formatAllActionItems(){
  var text = "";
  var data = ACTION_ITEM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    var isDone = "";
    if (data[i][3] && data[i][3] === "DONE"){
      isDone = " [DONE]";
    }
    text += (i + 1) + ": " + encodeForPostMessage(data[i][0]) + " - Assigned to: " + encodeForPostMessage(data[i][1]) + isDone + "%0A";
  } 
  
  return text;
}


function postAllActionItems(postChannel){
  var text = "All Action Items:%0A" + formatAllActionItems();
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
}

function formatOneUsersActionItems(userID){
  var text = "";
  var data = ACTION_ITEM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    var isDone = "";
    if (data[i][3] && data[i][3] === "DONE"){
      isDone = " [DONE]";
    }
    if (data[i][1].replace(new RegExp("<|@|>", "g"), "") === userID || data[i][1] === "Unassigned"){
    text += (i + 1) + ": " + encodeForPostMessage(data[i][0]) + " - Assigned to: " + encodeForPostMessage(data[i][1]) + isDone + "%0A";
    }      
  } 
  
  return text;
}

function postOneUsersActionItems(postChannel, userID){
  var text = "Your Action Items:%0A" + formatOneUsersActionItems(userID);
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
}

function formatOneTeamsActionItems(team){
  var teamList = getTeamList(team);
  var text = "";
  var data = ACTION_ITEM_SHEET.getDataRange().getValues();
  
  for (var i = 0; i < data.length; i++){
    var isDone = "";
    if (data[i][3] && data[i][3] === "DONE"){
      isDone = " [DONE]";
    }
    
    var assignedUsers = data[i][1].split(",");
    for (var j = 0; j < assignedUsers.length; j++){
      var currentUser = parseOutSpaces(assignedUsers[j]);
      if (teamList.indexOf(currentUser) > -1 || data[i][1] === "Unassigned"){
        text += (i + 1) + ": " + encodeForPostMessage(data[i][0]) + " - Assigned to: " + encodeForPostMessage(data[i][1]) + isDone + "%0A";
        break;
      }
    }      
  } 

  return text;
}

function postOneTeamsActionItems(postChannel, team){
  var text = team + "'s Action Items:%0A" + formatOneTeamsActionItems(team);
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  } 
}

function postAllActionItemsWithTeamNotification(){
  var text = "%3C!channel%3E This Week's Action Items:%0A" + formatAllActionItems();
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
}

function postUncompletedActionItems(){
  var text = "";
  var data = ACTION_ITEM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    if (!data[i][3] || data[i][3] != "DONE"){
      text += encodeForPostMessage(data[i][1]) + " has not completed: " + encodeForPostMessage(data[i][0]) + "... Shame!%0A";
    }
  }
  
  if (text === ""){
    text = "Everyone completed their action items this week... No Shame!";
  }
  
    var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
}

function handleClearMessage(messageArray, postChannel){
  if (messageArray.length < 3) {
    var suggestion = "If you are trying to remove completed action items, try %60clear done%60 or %60clear completed%60";
    postCommandNotFoundMessageWithSuggestion(suggestion, postChannel);
    return;
  }
  if (messageArray[2].toLowerCase() === "done" || messageArray[2].toLowerCase() === "completed" || messageArray[2].toLowerCase() === "finished") {
    clearDoneActionItems();
  }
  else {
    var suggestion = "If you are trying to remove completed action items, try %60clear done%60 or %60clear completed%60";
    postCommandNotFoundMessageWithSuggestion(suggestion, postChannel);
  }
}

function clearDoneActionItems(){
  var data = ACTION_ITEM_SHEET.getDataRange().getValues();
  for (var i = data.length - 1; i >= 0; i--){
    if (data[i][3] && data[i][3] === "DONE"){
      ACTION_ITEM_SHEET.deleteRow(i + 1);
    }
  }
}
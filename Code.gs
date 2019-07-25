var SPREADSHEET = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('spreadsheetID'));
var ACTION_ITEM_SHEET = SPREADSHEET.getSheets()[0];
var TEAM_SHEET = SPREADSHEET.getSheets()[1];
var SONG_SHEET = SPREADSHEET.getSheets()[2];
var DEBUG_SHEET = SPREADSHEET.getSheets()[3];
var TOKEN = PropertiesService.getScriptProperties().getProperty('oauthToken');
var MAIN_CHANNEL = PropertiesService.getScriptProperties().getProperty('mainChannel');
var POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";
var GET_USER_URL = "https://slack.com/api/users.info";

function doPost(e, res) {
  var json = JSON.parse(e.postData.contents);
  var messageWithoutDuplicateSpaces = json.event.text.replace( /\s\s+/g, ' ' );
  var messageArray = messageWithoutDuplicateSpaces.split(" ");
  
  if (json.event.subtype === "bot_message"){
    return;
  }
  
  switch (json.event.type) {
    case "app_mention":
      var text = json.event.text;
      
      switch(messageArray[1].toLowerCase()) {
        case "add":
          addNewActionItem(text);
          break;
        case "assign":
          assignActionItem(text);
          break;
        case "complete":
        case "finish":
        case "done":
          markActionItemAsCompleted(text);
          break;
        case "shame":
          postUncompletedActionItems();
          break;
        case "show":
        case "list":
          handleShowActionItems(messageArray, json.event.channel, json.event.user);
          break;
        case "clear":
          handleClearMessage(messageArray, json.event.channel);
          break;
        case "song":
          handleSongCommands(messageArray, json);
          break;
        case "register":
          handleRegistration(messageArray, json);
          break;
        case "help":
          postHelpMessage(json.event.channel);
          break;
        default:
          postCommandNotFoundMessage(json.event.channel);
          break;
      }
      res.sendStatus(200);
      return ContentService.createTextOutput(JSON.stringify(json));
      break;
      
    case "message":   
      var messageText = json.event.text;
      if (messageText.toLowerCase().indexOf("list all") > -1 || messageText.toLowerCase().indexOf("show all") > -1 || messageText.toLowerCase().indexOf("all action items") > -1 || messageText.toLowerCase().indexOf("all ai") > -1) {        
        postAllActionItems(json.event.channel);
      }
      else if (messageText.toLowerCase().indexOf("list my") > -1 || messageText.toLowerCase().indexOf("show my") > -1 || messageText.toLowerCase().indexOf("my action items") > -1 || messageText.toLowerCase().indexOf("my ai") > -1 ||
        messageText.toLowerCase().indexOf("list mine") > -1 || messageText.toLowerCase().indexOf("show mine") > -1) {        
        postOneUsersActionItems(json.event.channel, json.event.user);
      }
      else if (messageArray[0].toLowerCase() === "help" || messageArray[1].toLowerCase() === "help") {
        postHelpMessage(json.event.channel);
      }
      break;
      
    default:
  }
  res.sendStatus(200);
  return ContentService.createTextOutput(JSON.stringify(json));
}

function postHelpMessage(postChannel){
  var text = 'The following commands are available:%0A\
  []=required argument, ()=optional argument%0A\
  %60add [NEW ACTION ITEM] (@USER)%60 - Creates a new action item, end your message with @(USER) to assign it to that user%0A\
  %60show all %7C list all%60 - Displays the list of all current action items%0A\
  %60show my %7C list my%60 - Displays the list of your current action items (includes unassigned ones)%0A\
  %60show team [TEAM] %7C list team [TEAM]%60 - Displays the list action items for the specified team (includes unassigned ones)%0A\
  %60assign [ACTION ITEM NUMBER] to [@USER]%60 - Assigns an existing action item to a user, use the number from %60show all%60%0A\
  %60complete %7C finish %7C done [ACTION ITEM NUMBER]%60 - Marks an action item as DONE, use the number from %60show all%60%0A\
  %60shame%60 - Posts all uncompleted action items (and shames their owner)%0A\
  %60clear done %7C completed %7C finished%60 - Removes all action items marked as DONE%0A\
  %60register [USER] [TEAM]%60 - Adds the user to the specified team (for tracking action items)%0A\
  ';
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);;
  }
}

function postCommandNotFoundMessage(postChannel){
  var text = "Sorry, I didn't understand that";
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}

function postCommandNotFoundMessageWithSuggestion(suggestion, postChannel){
  var text = "Sorry, I didn't understand that%0A%0A";
  text += suggestion;
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}

function postUpdateChangeLog(){
  var text = 'Casper has been updated to v1.3.0:%0A%0A%0ACHANGELOG:%0A\
  -NEW COMMAND: %60register [USER] [TEAM]%60 - Adds a user to the specified team (for tracking action items).%0A\
  -NEW COMMAND: %60show team [TEAM] %7C list team [TEAM]%60 - Displays the list action items for the specified team (includes unassigned ones)%0A\
  These commands should let us keep using Casper for split retros without things getting too confusing.%0A\
  -NEW COMMAND: %60song request [SONG]%60 - Add in a song request that can be selected randomly. You can only add one per week.%0A\
  -NEW COMMAND: %60song select%60 - Randomly select a song from the list of requests. This removes it from the list.%0A\
  -BUGS: The song commands might not work entirely. I wrote them a long time ago and kind of forget.%0A\
  ';
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}
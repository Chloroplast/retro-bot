function handleSongCommands(messageArray, json) {
  DEBUG_SHEET.appendRow([json]);
  switch(messageArray[2].toLowerCase()){
    case "request": 
      handleNewSongRequest(messageArray, json.event.user);
      break;
    case "select":
      postRandomSong();
      break;
    default:
      postSongHelpMessage();
      break;
  }
}

function postSongHelpMessage(postChannel){
  var text = 'The following song commands are available:%0A\
[]=required argument, ()=optional argument%0A\
%60request [SONG TITLE/ARTIST]%60 - Adds a new song to the request list, you can only add one per week%0A\
%60select%60 - Picks a song randomly from the request list then deletes it from the list%0A\
';
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + postChannel + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);;
  }
}

function handleNewSongRequest(messageArray, userID){
  DEBUG_SHEET.appendRow(["here 2"]);
  if (validRequestForUser(userID)){
    addSongRequest(messageArray, userID);
  }
  else{
    postRequestAlreadyMadeMessage();
  }
}

function validRequestForUser(userID){
  DEBUG_SHEET.appendRow(["here 3"]);
  var data = TEAM_SHEET.getDataRange().getValues();
  var teamSize = data.length;
  
  for (var i = 0; i < teamSize; i++){
    DEBUG_SHEET.appendRow([parseOutUserIDSymbols(data[i][USER_ID_INDEX]) === userID && !data[i][SONG_REQUEST_INDEX]]);
    if (parseOutUserIDSymbols(data[i][USER_ID_INDEX]) === userID && !data[i][SONG_REQUEST_INDEX]){
      DEBUG_SHEET.appendRow(["here a trillion"]);
      return true;
    }
  }
  DEBUG_SHEET.appendRow(["here false"]);
  return false;
}

function addSongRequest(messageArray, userID){
  DEBUG_SHEET.appendRow(["here 4"]);
  var data = TEAM_SHEET.getDataRange().getValues();
  var teamSize = data.length;
  
  for (var i = 0; i < teamSize; i++){
    DEBUG_SHEET.appendRow([parseOutUserIDSymbols(data[i][USER_ID_INDEX]) === userID]);
    if (parseOutUserIDSymbols(data[i][USER_ID_INDEX]) === userID){
      SONG_SHEET.appendRow([messageArray.slice(3, messageArray.length).join(' '), data[i][USER_ID_INDEX]]);
      TEAM_SHEET.getRange(i + 1, SONG_REQUEST_COLUMN).setValue("SONG REQUEST ADDED");
      postSongRequestAddedMessage();
    }
  }  
}

function postSongRequestAddedMessage(){
  var text = "Song request successfully added";
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}

function postRequestAlreadyMadeMessage(){
  var text = "You already made your song request this week";
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}

function postRandomSong(){
  var songAndRequester = randomlySelectSongAndRequesterThenDelete();
  var text = songAndRequester[0] + "%0ARequested by: " + songAndRequester[1];
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }
}
  
function randomlySelectSongAndRequesterThenDelete(){
  var data = SONG_SHEET.getDataRange().getValues();
  var songListSize = data.length;
  var randomSongIndex = Math.floor(Math.random() * songListSize);
  SONG_SHEET.deleteRow(randomSongIndex + 1);
  return [encodeForPostMessage(data[randomSongIndex][0]), encodeForPostMessage(data[randomSongIndex][1])];
}
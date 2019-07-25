var REAL_NAME_COLUMN = 1;
var REAL_NAME_INDEX = REAL_NAME_COLUMN -1;
var USER_ID_COLUMN = 2;
var USER_ID_INDEX = USER_ID_COLUMN - 1;
var TEAM_COLUMN = 3;
var TEAM_INDEX = TEAM_COLUMN - 1;
var SONG_REQUEST_COLUMN = 4;
var SONG_REQUEST_INDEX = SONG_REQUEST_COLUMN - 1;

function handleRegistration(messageArray, json){
  var userId = messageArray[2];
  var teamName = messageArray[3];
  
  if (!userId){ 
    postCommandNotFoundMessageWithSuggestion("You must specify someone to register", MAIN_CHANNEL);
    return;
  }
  
  if (!teamName){
    postCommandNotFoundMessageWithSuggestion("You must specify a team to register someone to", MAIN_CHANNEL);
    return;
  }
  
  if (isUserRegisteredAlready(userId)){
    postCommandNotFoundMessageWithSuggestion("User already registered", MAIN_CHANNEL);
    return;
  }
  
  TEAM_SHEET.appendRow([getUserName(userId), userId, teamName]);
}

function isUserRegisteredAlready(id){
  var data = TEAM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    if(data[i][USER_ID_INDEX] === id){
      return true;
    }
  }
  return false;
}

function getTeamList(team){
  var data = TEAM_SHEET.getDataRange().getValues();
  var teamList = [];
  for (var i = 0; i < data.length; i++){
    if(data[i][TEAM_INDEX].toLowerCase() === team.toLowerCase()){
      teamList.push(data[i][USER_ID_INDEX]);
    }
  }
  
  return teamList;
}

function populateTeamListFromSlackCodes() {
  var data = TEAM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    var realName = getUserName(data[i][USER_ID_INDEX]);
    TEAM_SHEET.getRange(i + 1, REAL_NAME_COLUMN).setValue(realName);
  }
}

function randomlySelectTeamMember(){
  var data = TEAM_SHEET.getDataRange().getValues();
  var teamSize = data.length;
  var randomTeamMemberIndex = Math.floor(Math.random() * teamSize);
  return encodeForPostMessage(data[randomTeamMemberIndex][USER_ID_INDEX]);
}

function resetSongRequestUserList(){
  TEAM_SHEET.deleteColumn(SONG_REQUEST_COLUMN);
}
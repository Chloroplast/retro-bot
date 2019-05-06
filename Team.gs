function populateTeamListFromSlackCodes() {
  var data = TEAM_SHEET.getDataRange().getValues();
  for (var i = 0; i < data.length; i++){
    var realName = getUserName(data[i][1]);
    TEAM_SHEET.getRange(i + 1, 1).setValue(realName);
  }
}

function postSassySnackReminder(){
  var data = TEAM_SHEET.getDataRange().getValues();
  var randomTeamMember = randomlySelectTeamMember();
  var text = randomlySelectSassySnackMessage(randomTeamMember);
  
  var reqUrl = POST_MESSAGE_URL + "?token=" + TOKEN + "&channel=" + MAIN_CHANNEL + "&text=" + text;
  
  try {
    var response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
}

function randomlySelectTeamMember(){
  var data = TEAM_SHEET.getDataRange().getValues();
  var teamSize = data.length;
  var randomTeamMemberIndex = Math.floor(Math.random() * teamSize);
  return encodeLessThanAndGreaterThan(data[randomTeamMemberIndex][0]);
}

function randomlySelectSassySnackMessage(teamMember){
  var messages = ["I just think it's kind of funny that " + teamMember + " hasn't told us what snacks they're bringing to retro tomorrow",
                  teamMember + " you don't have to bring snacks to retro tomorrow, but everyone else has been doing it...",
                  "I know you love eating the snacks at retro " + teamMember + " but how about bringing them tomorrow for a change?",
                  teamMember + " you forgot to tell us what snacks you're bringing for retro tomorrow! just a friendly reminder!!! :) :)",
                  "I do all the real work at retro, the least " + teamMember + " could do is bring some snacks tomorrow",
                  "Weird that it's already the end of Thursday and " + teamMember + " forgot to tell everyone they're bringing snacks to retro tomorrow",
                 ];
  
  var randomMessageIndex = Math.floor(Math.random() * messages.length);
  return messages[randomMessageIndex];
}
function encodeForPostMessage(str){
  var encodedStr = str.replace(new RegExp("<", "g"), "%3C");
  encodedStr = encodedStr.replace(new RegExp(">", "g"), "%3E");
  encodedStr = encodedStr.replace(new RegExp(",", "g"), "%2C");
  return encodedStr;
}

function parseOutSpaces(str){
  return str.replace(new RegExp(" *", "g"), "");
}

function parseOutUserIDSymbols(id){
  return id.replace(new RegExp("<|@|>| *", "g"), "");
}

function getUserName(id){
  var parsedUserID = parseOutUserIDSymbols(id);
  
  var reqUrl = GET_USER_URL + "?token=" + TOKEN + "&user=" + parsedUserID;

  var response;
  try {
    response = UrlFetchApp.fetch(reqUrl);
  }
  catch (err) {
    console.log(err);
  }  
  return JSON.parse(response).user.real_name;
}


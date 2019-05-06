function encodeLessThanAndGreaterThan(str){
  var encodedStr = str.replace(new RegExp("<", "g"), "%3C");
  encodedStr = encodedStr.replace(new RegExp(">", "g"), "%3E");
  return encodedStr;
}

function getUserName(id){
  console.log(id);
  var parsedUserID = id.replace(new RegExp("<|@|>", "g"), "")
  
  
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
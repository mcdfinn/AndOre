//load view.js before running this
//also uses rl.js -- http://cs.stanford.edu/people/karpathy/reinforcejs/

var productionServerUrl = "http://ao.iwanttorule.space";
var production_game_server_endpoint = "/game-server";
var production_ai_storage_endpoint = "/ai-storage-server";

var devServerUrl = "http://localhost";
var dev_game_server_endpoint = ":7001";
var dev_ai_storage_endpoint = ":7003";

var use_dev_server = true;  // Used for development
var internetOff = false;  // Used for testing view.js

var ai_name = '';

if (use_dev_server) {
    var game_server_endpoint = devServerUrl + dev_game_server_endpoint;
    var ai_storage_endpoint = devServerUrl + dev_ai_storage_endpoint;
} else {
    var game_server_endpoint = productionServerUrl + production_game_server_endpoint;
    var ai_storage_endpoint = productionServerUrl + production_ai_storage_endpoint;
}

function ArrayToKeys(inArray) {
  var out = {};
  for (i in inArray){
    out[inArray[i]] = true;
  }
  return out;
}

var app = {
  delay: 10,
  hasActed: false,
  userId: null,
  startAiKey: '~',
  AiStarted: false,
  oldBrain: '',
  repeats: 0,  // Times updateAI has been called since last upload
  repeatsUntilUpload: 50, // Times updateAI has to be called until the model is saved on the AI storage server
  tick: 0,
  newAction: false,
  keys: ArrayToKeys([
      "a",  // Direction Key
      "w",  // Direction Key
      "s",  // Direction Key
      "d",  // Direction Key
      "k",  // Primary Modifier Key
      "l",  // Primary Modifier Key
      "m",  // Primary Modifier Key
      "i",  // Primary Modifier Key
      "-",  // Primary Modifier Key
      "+",  // Primary Modifier Key
      "b",  // Primary Modifier Key
      "u",  // Primary Modifier Key
      "0",  // Secondary Modifier Key
      "1",  // Secondary Modifier Key
      "2",  // Secondary Modifier Key
      "3",  // Secondary Modifier Key
      "4",  // Secondary Modifier Key
      "5",  // Secondary Modifier Key
      "6",  // Secondary Modifier Key
      "7",  // Secondary Modifier Key
      "8",  // Secondary Modifier Key
      "9"   // Secondary Modifier Key
  ]),
  lastAction: "a",
  lastHealth: 100,
  lastAge: 0,
  Init: function() {
  	app.GetUserId(function(){
  		view.SetupView(app.GetDisplay);
  	});
  },


  GetUserId:function(callback) {
    var self = this;
    AjaxCall("/join", {sendState: false}, function(data) {
      userId = data.id;
      $("body").keypress(function(e) {
        if (String.fromCharCode(e.which) == self.startAiKey && self.AiStarted == false) {
            self.AiStarted = true;
            app.getModel(self);
        }
      });
      CallCallback(callback);
    });
  },
  GetDisplay: function(callback) {
  	AjaxCall("/sendState", {id: userId}, function(data){
      view.Draw(data.world);
  		CallCallback(callback);
  	});
  },
  SendCommand: function(command){
    AjaxCall("/action", {id: userId, action: command, sendState:true}, function(data){ 
      view.Draw(data.world);
    });
  },
  StartAi: function(){
      this.ai = new BaseAi();
  },
  UpdateAi: function(data, callback){
    this.ai.Update(data);
    this.repeats += 1;
    if (this.repeats % this.repeatsUntilUpload == 0) {
        this.uploadModel(JSON.stringify(this.agent.toJSON()));
    }

    setTimeout(callback, self.delay);
  },
}

function CallCallback (callback){
  if(callback != null) {
    callback();
  }
}

function AjaxCall(endpoint, data, callback, failCallback){
  if(internetOff){
    callback(testData);    
  }

  var ajax = $.ajax({
    method: "GET",
    url: game_server_endpoint + endpoint,
    data: data,
  });
  ajax.done(function(data) {
    //console.log("from " + apiUrl + endpoint + " returned: " + data);
    callback(data);
  });
  ajax.fail(function(req, status, error){
    //console.log("bad req to " + apiUrl + endpoint + ":  " + status + " | " + error);
    if(failCallback != null){

      failCallback();      
    }
  });
}


var testData = {"id":"49f282b5-6ac9-4705-a692-fa1c23809f87","world":[["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!","!"],["h","p",":"," ","1","0","0"," ","o","r","e",":"," ","0"," ","r","o","w",":"," ","2","4"," ","c","o","l",":"," ","2","4"," "]]}


$(app.Init);

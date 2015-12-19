angular.module('starter.controllers', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite,$rootScope) {
  var stopajaxcall= null; 
    
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
    
    function constructSessionID(id) {
		
        return id.replace(/:|-/g, '');
		
    }
    
       $rootScope.saveMessage = function(message ,destination,image,isread,isuser) {

    $cordovaSQLite.execute( $rootScope.db, 'INSERT INTO CHAT (message,destination,userimage,isread,isuser) VALUES (?,?,?,?,?)', [message ,destination,image,isread,isuser])
        .then(function(result) {
            console.log("Message saved successfully");
        }, function(error) {
            console.log("Error on saving: " + error.message);
        })
     };
    
   //Initiating the ActiveMQ server connection
    $rootScope.initiate = function() {
      var url = "ws://localhost:61614";
      //  var url = "ws://cmterainsight:61614";
      var username = "admin";
      var passcode = "password";
	  var destination = '/topic/chat.*';
    
 
      client = Stomp.client(url);
      var headers = {
        login: 'mylogin',
        passcode: 'mypasscode',
        // additional header
        'client-id': 'operator0'
      };

      var headersq = {
        'activemq.subscriptionName': 'operator0'
      };

	  client.connect(destination, function(frame) {
        var path = constructSessionID(frame.headers.session + "");
        $rootScope.ReceiveMessage = client.subscribe('/topic/chat.*', function(message) {
            $rootScope.destination = message.headers.destination;
            console.log("destination ID :" + $rootScope.sendID);
			console.debug(message);
            console.debug("Path :"+path);
            var msgID = constructSessionID(message.headers["message-id"] + "");
            $rootScope.receivingMessage = message.body;
            $rootScope.userName = $rootScope.destination.split(".");
            $rootScope.userName =  $rootScope.userName[1];

            
            if (msgID.indexOf(path) > -1) {

              var reply = message.body + ('<p> <font size="1" color="black">' + new Date().toLocaleString() + '</font></p>');

              $('<div class="msg_b"> <div class="profile-pic-right"><img src="img/send.png"></div> <p style="color:black;">' + reply + '</p> </div>').insertBefore('.enter-msg');

            } 
            else {
				if($rootScope.destination == $rootScope.sendID){

                  var reply = message.body + ('<p> <font size="1" color="white">' + new Date().toLocaleString() + '</font></p>');
                  $('<div class="msg_a"> <div class="profile-pic-left"> <img  src="img/receive.png"></div> <p style="color:white;">' + reply + '</p> </div>').insertBefore('.enter-msg');
                    console.log("fucked here top");
                  $rootScope.saveMessage($rootScope.receivingMessage,$rootScope.sendID,'','1','1');
				}
				else{
                    console.log("fucked here down");
				$rootScope.saveMessage($rootScope.receivingMessage,$rootScope.sendID,'','0','1');	
				}
            } 
         }, headersq);
   
      });
	  console.log("successfully initiated");
    };    
    
  $rootScope.initiate();  
  //  $ionicConfigProvider.views.maxCache(0);
    
})




.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, $ionicHistory, Chats, $cordovaSQLite, $ionicPlatform, $rootScope,$interval,$state) {

  $rootScope.sendID ='/topic/chat.thuan';
  $rootScope.db;
  $rootScope.receivingMessage;
  $rootScope.userName;
  $rootScope.operatorMessage;
  $rootScope.dataFromDb = null;
  $rootScope.chats = Chats.all();
  $rootScope.destination='/topic/chat.thuan';
  $rootScope.previousMessage='';
   // $ionicConfigProvider.views.maxCache(0);
  

//method declaration

 
	 
	$scope.loadMessagefromDb = function(data){
  
        if (data != null && data.rows.length > 0 ) {
              
            for(var i = 0; i < data.rows.length; i++)  {
              
                if(data.rows[i].isuser == 0){
          
              
                    $('<div class="msg_b"> <div class="profile-pic-right"><img src="img/send.png"></div> <p style="color:black;">' +  data.rows[i].message + '</p> </div>').insertBefore('.enter-msg');

                } 
				else {

           
                   $('<div class="msg_a"> <div class="profile-pic-left"> <img  src="img/receive.png"></div> <p style="color:white;">' + data.rows[i].message  + '</p> </div>').insertBefore('.enter-msg');
                }
              
            }
        }
    };

	$scope.sendMessage = function() {

      var text = $('#user_input').val();

        if (text != '') {
          
		  client.send($rootScope.sendID, {},text); //destination
		  console.log("message submitted");
		  $('#user_input').val("");
		  $scope.operatorMessage = text;
		 // $rootScope.saveMessage(text,$rootScope.sendID,'','1','0');
            
        }

    };
	
	$scope.clear = function(){
       $(".msg_b").hide();
       $(".msg_a").hide();
    };
	
	$scope.readMessages = function(userid) {
	   if(userid != null){
			  var query = 'SELECT * FROM CHAT where destination ="'+userid+'";';
			  var queryParam = [];
			  $cordovaSQLite.execute( $rootScope.db, query, queryParam).then(function(res) {
			  $scope.dataFromDb = res;
			  console.log(res);
			  }, function(err) {
				 alert("Error on Read");
			 });
	    }
    };
	 
	$scope.remove = function(chat) {
      Chats.remove(chat);
    }; 
	
	//Disconnecting the ActiveMQ server connection
    $scope.disconnect = function() {
      var exit = 'DIRROUTETOBOT';
		client.send($rootScope.sendID, {}, exit);
			client.disconnect(function() {
				console.log("connection disconnected!");
				$ionicHistory.goBack();
			})
	}
    
    $scope.getNewMessagesOwners= function(){
     
			  var query = 'SELECT destination,count(destination) as msgcount,userimage FROM CHAT where isuser = "1" and isread = "0" group by destination';
			  var queryParam = [];
			  $cordovaSQLite.execute( $rootScope.db, query, queryParam).then(function(res) {
			 // $scope.dataFromDb = res;
                   $rootScope.userlist = null;
                   $rootScope.userlist = res.rows;  
               // console.log("user list#:"+res);  
			    console.log("user list :"+ angular.fromJson( $rootScope.userlist ));
               
			  }, function(err) {
				 alert("Error on Read");
			 });
	}
	
	$rootScope.pushuserlist = function(){
    
    
    $state.go('tab.chats'); 
    stopajaxcall = $interval(function() {
        // $state.go($state.current, {}, {reload: true});
         $scope.getNewMessagesOwners();
         
        console.log($state.current.name);
         if($state.current.name != 'tab.chats'){
          $interval.cancel( stopajaxcall );
         }
        
          }, 5000);
   
    }
	
 
    
    
    
	//var page = $ionicHistory.currentView();
 // console.log(window.location.hash );
 //console.log("current view: "+index.index);

 
 
 
 /*
 if(page.index ==1){
 $scope.readMessages($rootScope.sendID);
 $scope.loadMessagefromDb($rootScope.dataFromDb);
 console.log("methods executed");
 }
 */
 // $scope.readMessages($rootScope.sendID);
//$scope.loadMessagefromDb($rootScope.dataFromDb);
 
   $ionicPlatform.ready(function() {
    if (window.cordova) {
      //device
      $rootScope.db = $cordovaSQLite.openDB({
        name: "draco1.db"
      });
  
    } else {
      // browser
      $rootScope.db = window.openDatabase("draco1.db", '1', 'draco1', 1024 * 1024 * 100);
    }
    $cordovaSQLite.execute( $rootScope.db, 'CREATE TABLE IF NOT EXISTS CHAT (message,destination,userimage,isread ,isuser)');
	//$scope.readMessages($rootScope.sendID);
	
  });

})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $rootScope) {
   $rootScope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $rootScope) {
   $rootScope.settings = {
    enableFriends: true
  };
});



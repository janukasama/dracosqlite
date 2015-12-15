var db = null;

angular.module('starter.controllers', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, $ionicHistory, Chats, $cordovaSQLite, $ionicPlatform, $rootScope) {


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $rootScope.sendID;
  $scope.db;
  $scope.receivingMessage;
  $scope.userName;
  $rootScope.operatorMessage



  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };


  //Initiating the ActiveMQ server connection
  $scope.initiate = function() {
      var url = "ws://localhost:61614";
      var username = "admin";
      var passcode = "password";
      var destination = "/topic/chat.thuan";
      
      
      $scope.readMessages($rootScope.sendID);
      $scope.loadMessage();

      client = Stomp.client(url);
      var headers = {
        login: 'mylogin',
        passcode: 'mypasscode',
        // additional header
        'client-id': 'thuan'
      };

      var headersq = {
        'activemq.subscriptionName': 'thuan'
      };


      function constructSessionID(id) {
        return id.replace(/:|-/g, '');
      }


      client.connect(destination, function(frame) {
        var path = constructSessionID(frame.headers.session + "");
        $rootScope.ReceiveMessage = client.subscribe('/topic/chat.*', function(message) {
          $rootScope.sendID = message.headers.destination;
          console.log("destination ID :" + $rootScope.sendID);
          console.debug(message);
          var msgID = constructSessionID(message.headers["message-id"] + "");
          $scope.receivingMessage = message.body;
          $scope.userName = $rootScope.sendID.split(".");
          $scope.userName = $scope.userName[1];



          if (msgID.indexOf(path) > -1) {

            var reply = message.body + ('<p> <font size="1" color="black">' + new Date().toLocaleString() + '</font></p>');

            $('<div class="msg_b"> <div class="profile-pic-right"><img src="img/send.png"></div> <p style="color:black;">' + reply + '</p> </div>').insertBefore('.enter-msg');

          } else {

            var reply = message.body + ('<p> <font size="1" color="white">' + new Date().toLocaleString() + '</font></p>');

            $('<div class="msg_a"> <div class="profile-pic-left"> <img  src="img/receive.png"></div> <p style="color:white;">' + reply + '</p> </div>').insertBefore('.enter-msg');
             
            $scope.saveMessage( $scope.receivingMessage,$rootScope.sendID,'','1','1');
          }

        }, headersq);


      });

      console.log("successfully initiated");
    }
    //end of initiation
 $scope.loadMessage = function(){
  
      //for(var i =0; i< data.rows.length; i++){

          if ($scope.dataFromDb==1) {

              var reply =  $scope.dataFromDbmsg + ('<p> <font size="1" color="black"></font></p>');

            $('<div class="msg_b"> <div class="profile-pic-right"><img src="img/send.png"></div> <p style="color:black;">' + reply + '</p> </div>').insertBefore('.enter-msg');

          } else {
/*
            var reply = message.body + ('<p> <font size="1" color="white">' + new Date().toLocaleString() + '</font></p>');

            $('<div class="msg_a"> <div class="profile-pic-left"> <img  src="img/receive.png"></div> <p style="color:white;">' + reply + '</p> </div>').insertBefore('.enter-msg');
             */
            $scope.saveMessage( $scope.receivingMessage,$rootScope.sendID,'','1','1');
          }

//}      
      
      
      
}


  $scope.sendMessage = function() {

    var text = $('#user_input').val();

    if (text != '') {
      client.send($rootScope.sendID, {}, text); //destination
      console.log("message submitted");
      $('#user_input').val("");
      $rootScope.operatorMessage = text;
      $scope.saveMessage(text,$rootScope.sendID,'','1','0');
            
    }

  }

  var num = 1;

  $ionicPlatform.ready(function() {
    if (window.cordova) {
      //device
      $scope.db = $cordovaSQLite.openDB({
        name: "draco1.db"
      });
      //         db = $cordovaSQLite.openDB({
      //            name: "my.db",
      //            bgType: 1
      //         });
    } else {
      // browser
      $scope.db = window.openDatabase("draco1.db", '1', 'draco1', 1024 * 1024 * 100);
    }
    $cordovaSQLite.execute($scope.db, 'CREATE TABLE IF NOT EXISTS CHAT (message,destination,userimage,isread ,isuser)');
   // $cordovaSQLite.execute($scope.db, 'CREATE TABLE IF NOT EXISTS CHATOPERATOR (destination,usermessage,messageFrom)');
  });

/*  $scope.userMsg = function(message,destination,userimage,isread,isuser) {
    var query = 'INSERT INTO CHAT (message,destination,userimage,isread,isuser) VALUES (?,?,?,?,?,?)';
    var queryParam = [$scope.receivingMessage,$rootScope.sendID,'null','1','1'];
    $cordovaSQLite.execute($scope.db, query, queryParam).then(function(res) {
      alert("Insert ID : " + res.insertId + " | " + "Rows affected : " + res.rowsAffected);
     // num++;
    }, function(err) {
      alert("Error on inserting");
    });
  };*/

/*  $scope.operatorMsg = function() {
    var query = 'INSERT INTO CHATOPERATOR (destination, operatormessage,messageFrom) VALUES (?,?,?)';
    var queryParam = [$rootScope.sendID, $rootScope.operatorMessage, "operator"];
    $cordovaSQLite.execute($scope.db, query, queryParam).then(function(res) {
      alert("Insert ID : " + res.insertId + " | " + "Rows affected : " + res.rowsAffected);
      num++;
    }, function(err) {
      alert("Error on Create");
    });
  };*/

    
    $scope.saveMessage = function(message ,destination,image,isread,isuser) {

    $cordovaSQLite.execute($scope.db, 'INSERT INTO CHAT (message,destination,userimage,isread,isuser) VALUES (?,?,?,?,?)', [message ,destination,image,isread,isuser])
        .then(function(result) {
            console.log("Message saved successfully");
        }, function(error) {
            console.log("Error on saving: " + error.message);
        })
     };
    
  
    

  $scope.readMessages = function(userid) {
    var query = 'SELECT * FROM CHAT where destination ="'+userid+'";';
    var queryParam = [];
    $cordovaSQLite.execute($scope.db, query, queryParam).then(function(res) {
        //for(var i=0; i<rows.length; i++){
        $scope.dataFromDb = res.rows[1].isuser;
        $scope.dataFromDbmsg = res.rows[1].message;
        console.log(res);
        //console.log("data from db"+$scope.dataFromDb);
        console.log(res.rows[1].isuser);
        //alert("Returned messages : " + res.rows.length);
        //}
    }, function(err) {
      alert("Error on Read");
    });
  };




  //Disconnecting the ActiveMQ server connection
  $scope.disconnect = function() {
    var exit = 'DIRROUTETOBOT';
    client.send('/topic/chat.thuan', {}, exit);


    client.disconnect(function() {
      console.log("connection disconnected!");

      $ionicHistory.goBack();
    })
  }
})




.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

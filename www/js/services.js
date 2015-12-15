angular.module('starter.services', [])



.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data

    
    
  var chats = [{
    //id: 4,
    name: 'Pubudu Welagedara',
    lastText: 'This is wicked good ice cream.',
    face: 'https://s.yimg.com/wv/images/a9696dca20fc0835ff82d7e0c7fc3a91_96.png',
      
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

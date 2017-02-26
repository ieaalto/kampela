$ = require('jquery');


module.exports = {};

function _ajax(url, method, data){
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            type: method,
            dataType: "application/json",
            data : data,
            complete: (jqxhr) => {
                resolve(JSON.parse(jqxhr.responseText))
            }
        })
    });
}
module.exports.getContext = function() {
    return _ajax("/context/", "GET")
};

module.exports.getUser = function() {
    return _ajax("/me/", "GET")
};

module.exports.getChannels = function() {
    return _ajax("/channels/", "GET")
};

module.exports.getConnections = function() {
    return _ajax("/connections/", "GET")
};

module.exports.getUsersOnChannel = function(channel_id) {
    return _ajax("/channels/" +channel_id+"/users/", "GET")
};

module.exports.getMessagesOnChannel = function(channel_id) {
    return _ajax("/channels/" +channel_id+"/messages/", "GET")
};

module.exports.joinChannel = function(channel_id) {
    return _ajax("/connections/", "POST", {channel : channel_id})
};

module.exports.partChannel = function(channel_id) {
    return _ajax("/connections/"+channel_id+"/", "DELETE")
};

module.exports.changeUsername = function(username) {
    return _ajax("/me/", "PUT", {username: username})
};

module.exports.sendMessage = function(channel_id, content) {
    return _ajax("/channels/" + channel_id + "/messages/", "POST", {content: content})
}

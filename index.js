"use strict";

var _Gcloud  = require('gcloud');
var _Ram     = require('ramda');

//workaround for errors not propagating from async await
process.on('unhandledRejection', err => { throw err; });


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function shouldDeleteTopic(topic) {
    var regex   = new RegExp('^delme_');
    let t_title = topic.name.split('/').pop();

    return t_title.match(regex);
}

var pubsub = _Gcloud.pubsub({ keyFilename: process.env.GCLOUD_AUTH_FILE });;

let topic_name='delme_' + getRandomInt(1,999999);

pubsub.createTopic(topic_name, function(err1, apiResponse1) {

    if (err1) {
        throw err1;
    }
    console.log(topic_name + ' created');

    pubsub.getTopics({pageSize: 50}, function (err2, topics, nextQuery, apiResponse2) {

        if (err2) {
            console.log('Error getting topics');
            throw err2;
        }

        var topics_to_delete = _Ram.filter(shouldDeleteTopic, topics);
        var topic_to_delete  = topics_to_delete.pop();

        console.log('attempting to delete topic ' + topic_to_delete.name);

        topic_to_delete.delete(function (err3, apiResponse3) {

            if (err3) {
                console.error('Error deleting topic!');
                console.log(apiResponse3);
                throw err3;
            }

            console.log('topic deleted with response');
            console.log(apiResponse3);
        });
    });
});

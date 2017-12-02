//Dependencies
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure');

var documentDbOptions = {
    host: 'https://trader-db.documents.azure.com:443/',
    masterKey: 'hwRHpNoNREov4xYITQnuyH1T9sMqIcKIIV9uiuIR94YZb25StqTIZkSltHLIMBJNo9yyFgu3ausa51lNmuAWRA==',
    database: 'botdocs',
    collection: 'botdata'
};


var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

var LUIS_MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6da5d499-5a63-4100-a229-d1d31cc46648?subscription-key=fe1edaedf937418d891e2482759bad8e&verbose=true&timezoneOffset=0";

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});


// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "a844a12d-1b82-4da3-8d52-fc2511f41764",
    appPassword: "yotoSBS156+[lezYPFX18:~"
});

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
}).set('storage', cosmosStorage);

// Listen for messages from users
server.post('/api/messages', connector.listen());

//Recognizer

var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('getPrice', function(session){ //Get Price of certain crypto

}).triggerAction({ matches: 'getPrice'});


bot.dialog('buyCrypto', function(session){//Buy crypto

}).triggerAction({ matches: 'buyCrypto'});


bot.dialog('sellCrypto', function(session){//Sell crypto

}).triggerAction({ matches: 'sellCrypto'});

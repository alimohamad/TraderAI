//Dependencies
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var cmd = require('node-cmd');
var smidgen = require('smidgen');
var Client = require('coinbase').Client;

  var documentDbOptions = {// Set up DB for logs
    host: 'https://trader-db.documents.azure.com:443/',
    masterKey: 'hwRHpNoNREov4xYITQnuyH1T9sMqIcKIIV9uiuIR94YZb25StqTIZkSltHLIMBJNo9yyFgu3ausa51lNmuAWRA==',
    database: 'botdocs',
    collection: 'botdata'
};

var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

var LUIS_MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6da5d499-5a63-4100-a229-d1d31cc46648?subscription-key=fe1edaedf937418d891e2482759bad8e&verbose=true&timezoneOffset=0";

var client = new Client({ //Coinbase Client Creation
  'apiKey': 'HoOPwjQ5gPxmmrCV',
  'apiSecret': 'krqOA9EaKWsk9FErOPVBx6YavAlnpGby',
  'version':'2017-12-02'
}); 

currencyCode = 'USD'; //currencyCode for client


//============================================================================  AZURE

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({ // Create chat connector for communicating with the Bot Framework Service

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


//==================================================================================================================== COINBASE

var currency = "";
var currencySymbol = "";
var id = "";

bot.dialog('getPrice', function(session, args){ //Get Price of certain stock
  
  var intent = args.intent;
  currency = ((builder.EntityRecognizer.findEntity(intent.entities, 'Cryptocurrency')).entity).toLowerCase();
  if(currency == "bitcoin"){currencySymbol = "BTC";}
  else if(currency == "ethereum"){currencySymbol = "ETH";}
  else if(currency == "litecoin"){currencySymbol = "LTC";}
  
  client.getBuyPrice({'currencyPair': (currencySymbol + '-' + currencyCode)}, function(err, price) {
    session.send( "The price of " + currency + " is " +  JSON.stringify(price.data.amount) + " dollars.");
  });

}).triggerAction({ matches: 'getPrice'});


bot.dialog('buyCrypto', function(session){//Buy crypto

  var intent = args.intent; console.log(intent);
  currency = ((builder.EntityRecognizer.findEntity(intent.entities, 'Cryptocurrency')).entity).toLowerCase();
  quantity = parseFloat(((builder.EntityRecognizer.findEntity(intent.entities, 'quantity')).entity)) * (0.001);
  console.log(quantity);
  if(currency == "bitcoin"){currencySymbol = "BTC"; }
  else if(currency == "ethereum"){currencySymbol = "ETH";}
  else if(currency == "litecoin"){currencySymbol = "LTC"; }

  client.getPaymentMethods(null, function(err, pms) {
    client.getAccount(currencySymbol, function(err, account) {
      account.buy({'amount' : quantity, 
        'currency': currencySymbol,
        'payment_method' : pms[1].id,
        'commit': false}, function(err, tx) {
          console.log("/n");
          console.log(tx);
          session.endDialog("You have now purchased " + quantity + " of " + currency + ".");
        });
    }); 
  });


}).triggerAction({ matches: 'buyCrypto'});


bot.dialog('sellCrypto', function(session){//Sell crypto

  var intent = args.intent; console.log(intent);
  currency = ((builder.EntityRecognizer.findEntity(intent.entities, 'Cryptocurrency')).entity).toLowerCase();
  quantity = parseFloat(((builder.EntityRecognizer.findEntity(intent.entities, 'quantity')).entity)) * (0.001);
  console.log(quantity);
  if(currency == "bitcoin"){currencySymbol = "BTC"; }
  else if(currency == "ethereum"){currencySymbol = "ETH";}
  else if(currency == "litecoin"){currencySymbol = "LTC"; }

  client.getPaymentMethods(null, function(err, pms) {
    client.getAccount(currencySymbol, function(err, account) {
      account.sell({
        'amount' : quantity, 
        'currency': currencySymbol,
        'commit': false}, function(err, tx) {
        console.log("/n");
        console.log(tx);
        session.endDialog("You have now sold " + quantity + " of " + currency + ".");
      });
  });

}).triggerAction({ matches: 'sellCrypto'});

bot.dialog('getAccountInfo', function(session){ //Get account info
  client.getAccounts({}, function(err, accounts) {
    for(var i = 0; i < 4; i++){
      if (i < 3) {
        session.send(accounts[i].name + ": " + accounts[i].balance.amount);
      }
      else {
        session.endDialog(accounts[i].name + ": " + accounts[i].balance.amount);
      }
    }
  });
}).triggerAction({ matches: 'getAccountInfo'});  

//===================================================================================================================== SMIDGEN

//bot.dialog('createWallet', function(session){ //Create multisignature IOTA wallet}).triggerAction({ matches: 'createWallet'});
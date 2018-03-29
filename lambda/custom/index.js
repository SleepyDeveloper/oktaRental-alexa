'use strict';
var Alexa = require("alexa-sdk");
var http = require("https");


// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build


exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard','to start using this skill, please use the companion app to authenticate');
            return;

        } else {
            // console.log ( this.event.session.user.accessToken )
            this.emit(':ask', 'Your Account is now Connected to Okta Car Rental, you can ask for an inventory of cars, reserve cars, and cancel reservations');
        }
        // this.emit(':ask','Welcome to Okta Car Rental. You and ask for available cars');
    },
    'ReserveCarIntent': function () {
        console.log ( this.event.request.intent.slots.Car["value"] )
        console.log ( this.event.request.intent.slots.Car["value"] )
        // console.log ( this.event.request.ReserveCarIntent.valueOf("Car") )
        // this.emit(':ask', 'You want to rent '+this.event.request.intent.slots)
        this.emit(':ask', 'I have made a reservation for you to get a'+this.event.request.intent.slots.Car["value"]+", the confirmation number is rl7-q278")
        // this.emit(':ask', 'You want to rent '+this.event.request.intent.slots.Cars.value);
    },
    'MyNameIsIntent': function () {
        this.emit('SayHelloName');
    },
    'LoginIntent': function () {
        this.emit(':ask','to get a list of cars say cars, reserve car, or cancel reservation');

    },
    'carsAvailableIntent': function () {

        if (this.event.session.user.accessToken == undefined) {
            this.emit(':emit','You must login to see available Cars');
        } else {
            var self = this;
            function callback(self, string) {
                self.response.speak('We have the following cars available: '+string).cardRenderer('we have cars !');
                self.emit(':responseReady');
            }
            var http = require("https");
            var options = {
                "method": "GET",
                "hostname": "pk5gzo4x02.execute-api.us-east-1.amazonaws.com",
                "port": null,
                "path": "/dev/vehicles",
                "headers": {
                    "authorization": "Bearer "+this.event.session.user.accessToken,
                    "cache-control": "no-cache"
                }
            };

            var req = http.request(options, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    var cars = body.toString();
                    var carsObj = {}
                    carsObj = JSON.parse(cars);
                    var outputString = ""

                    for (let item of carsObj.inventory) {
                        outputString += item.make + " " + item.model+", ";
                    }
                    callback ( self, outputString )
                });
            });

            req.end();


        }
    },
    'SayHello': function () {
        this.response.speak('Hello World!')
                     .cardRenderer('hello world', 'hello world');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
        var name = this.event.request.intent.slots.name.value;
        this.response.speak('Hello ' + name)
            .cardRenderer('hello world', 'hello ' + name);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};




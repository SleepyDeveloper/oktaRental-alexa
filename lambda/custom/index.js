/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const https = require('https');


const LaunchRequestHandlerWithoutAuthToken = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest" &&
            handlerInput.requestEnvelope.session.user.accessToken == undefined;
  }, handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('To start using this skill, please use the companion app to authenticate')
      .withLinkAccountCard()
      .getResponse();
  }
};

const LaunchRequestHandlerWithAuthToken = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest" &&
            handlerInput.requestEnvelope.session.user.accessToken;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Your account is now connected to Okta Car Rental, you can ask for the inventory of cars, reserve cars and cancle reservations')
      .getResponse();
  }
};

const LoginHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type == 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name == 'LoginIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('to get a list of cars say cars, reserve car, or cancel reservation')
      .getResponse();
  }
};

const ReserveCarHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ReserveCarIntent';
  },
  handle(handlerInput) {
    console.log('The car',handlerInput.requestEnvelope.request.intent.slots.Car.value)
    return handlerInput.responseBuilder
            .speak(`I have made a reservation for you to get ${handlerInput.requestEnvelope.request.intent.slots.Car.value} the confirmation number is rl7-q278`)
            .getResponse();
  }
};

const CarsAvailableHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'carsAvailableIntent';
  },
  handle(handlerInput) {
    const accessToken = handlerInput.requestEnvelope.session.user.accessToken;
    if (accessToken == undefined) {
        return handlerInput.responseBuilder
          .speak('To start using this skill, please use the companion app to authenticate')
          .withLinkAccountCard()
          .getResponse();      
    } else {
      
      let options = {
        "method": "GET",
        "hostname": "zx3l5ejnmk.execute-api.us-east-1.amazonaws.com",
        "port": null,
        "path": "/dev/vehicles",
        "headers": {
          "authorization": "Bearer " + accessToken,
          "cache-control": "no-cache"
        }
      };
      
      return new Promise((resolve, reject) => {
        httpGet(options).then((response) => {
          
          console.log('the response', response);
          let outputString = ""
          for (let item of response.inventory) {
              outputString += item.make + " " + item.model + ", ";
          }
          resolve(handlerInput.responseBuilder
            .speak('We have the following cars available: ' + outputString)
            .withSimpleCard('Okta Rental','we have cars !')
            .getResponse());
        }).catch((error) => {
          return handlerInput.responseBuilder
            .speak('There was an error connecting to the service')
            .getResponse();
        });
      });
    }
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Space Facts';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

function httpGet(options) {
  console.log('options', options);
  return new Promise(((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
      }

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
} 


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandlerWithoutAuthToken,
    LaunchRequestHandlerWithAuthToken,
    LoginHandler,
    ReserveCarHandler,
    CarsAvailableHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

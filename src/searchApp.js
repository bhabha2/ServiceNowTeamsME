const searchIncident = require("./searchIncident");
const updateIncident = require("./updateIncident");
// const updateIncident = require("./updateIncident");
const { TeamsActivityHandler, UserState, ActionTypes, ConversationState } = require("botbuilder");
// const actionHandler = require("./adaptiveCards/cardHandler");
// const ACData = require("adaptivecards-templating");
const { LRUCache } = require ('lru-cache');
// var cache = new LRUCache(cacheOptions);
let cacheOptions = {
  max: 500,
  // for use with tracking overall storage size
  maxSize: 5000,
  sizeCalculation: (value, key) => {
    return 1
  },
  // for use when you need to clean up something when objects are evicted from the cache
  dispose: (value, key) => {
  },

  // how long to live in ms
  ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,

  // async method to use for cache.fetch(), for
  // stale-while-revalidate type of behavior
  fetchMethod: async (
    key,
    staleValue,
    { options, signal, context }
  ) => { },
}
var cache = new LRUCache(cacheOptions);
// User Configuration property name
const USER_CONFIGURATION = 'userConfigurationProperty';
// let cacheStorage = new CacheStorage(cache);
const cacheInitFlag = "Init";
const cacheRevokeFlag = "Revoke";
const { access } = require("fs");
// var conversationState = ConversationState;
var userState = UserState;
 
// var cache = new LRUCache(cacheOptions);

class SearchApp extends TeamsActivityHandler {
  cacheOptions = {
    max: 500,
    // for use with tracking overall storage size
    maxSize: 5000,
    sizeCalculation: (value, key) => {
      return 1
    },
    // for use when you need to clean up something when objects are evicted from the cache
    dispose: (value, key) => {
    },
  
    // how long to live in ms
    ttl: 1000 * 60 * 5,
  
    // return stale items before removing from cache?
    allowStale: false,
  
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  
    // async method to use for cache.fetch(), for
    // stale-while-revalidate type of behavior
    fetchMethod: async (
      key,
      staleValue,
      { options, signal, context }
    ) => { },
  }
  conversationState = ConversationState;
  connectionName = process.env.connectionName;
  userState = userState;
  conversationDataAccessor='';
  userProfileAccessor='';
  constructor(conversationState, userState) {
    super();
    // Creates a new user property accessor.
    // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
    this.cache = new LRUCache(this.cacheOptions);
    this.userConfigurationProperty = userState.createProperty(
        USER_CONFIGURATION
    );
    this.connectionName = process.env.connectionName;
    this.userState = userState;
    this.userProfileAccessor = userState.createProperty(this.UserProfileProperty);
    this.conversationState = conversationState;
    this.conversationDataAccessor = this.conversationState.createProperty(this.ConversationDataProperty);
}

/**
 * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
 */
async run(context) {
  console.log("\r\nInside run");
    await super.run(context);
    // Save state changes
    await this.userState.saveChanges(context);
    await this.conversationState.saveChanges(context);
}

  async tokenIsExchangeable(context) {
    console.log('\r\ntokenIsExchangeable');
    let tokenExchangeResponse = null;
    try {
        const userId = context.activity.from.id;
        const valueObj = context.activity.value;
        const tokenExchangeRequest = valueObj.authentication;
        const userTokenClient = context.turnState.get(context.adapter.UserTokenClientKey);
  
        tokenExchangeResponse = await userTokenClient.exchangeToken(
            userId,
            this.connectionName,
            context.activity.channelId,
            { token: tokenExchangeRequest.token });
    } 
    catch (err) 
    {
        console.log('tokenExchange error: ' + err);
        // Ignore Exceptions
        // If token exchange failed for any reason, tokenExchangeResponse above stays null , and hence we send back a failure invoke response to the caller.
    }
    if (!tokenExchangeResponse || !tokenExchangeResponse.token) 
    {
        return false;
    }

    return true;
  }

  async handleTeamsMessagingExtensionQuery(context, query) {
    console.log("\r\nInside handleTeamsMessagingExtensionQuery");
    console.log("\r\nQuery: " + JSON.stringify(query));
  const userTokeninCache = cache.get(context.activity.from.id);
  const cloudAdapter = context.adapter;
  const userTokenClient = context.turnState.get(cloudAdapter.UserTokenClientKey);
  const magicCode =
    query.state && Number.isInteger(Number(query.state))
      ? query.state
      : '';
  const tokenResponse = await userTokenClient.getUserToken(
    context.activity.from.id,
    this.connectionName,
    context.activity.channelId,
    magicCode
  );

  const { signInLink } = await userTokenClient.getSignInResource(
    this.connectionName,
    context.activity
  );

  // console.log("\r\nToken Response.token: " + JSON.stringify(tokenResponse.token));
  // console.log("\r\nSignIn Link: " + signInLink);

  //token is not in cache means user has not signed in yet
  if (!userTokeninCache) {

    cache.set(context.activity.from.id, cacheInitFlag);

    return {
      composeExtension: {
        type: 'auth',
        suggestedActions: {
          actions: [
            {
              type: 'openUrl',
              value: signInLink,
              title: 'Bot Service OAuth'
            },
          ],
        },
      },
    };
  }
  //if token in cache, always update the token based on system stored user token
  else if (tokenResponse && tokenResponse.token) {

    if (userTokeninCache.toString().startsWith(cacheRevokeFlag) && userTokeninCache.toString().endsWith(tokenResponse.token)) {
      console.log("\r\nToken is revoked, need to sign in again");
      return {
        composeExtension: {
          type: 'auth',
          suggestedActions: {
            actions: [
              {
                type: 'openUrl',
                value: signInLink,
                title: 'Bot Service OAuth'
              },
            ],
          },
        },
      };
    }
    else {
      cache.set(context.activity.from.id, tokenResponse.token);
      console.log("\r\nCache Status updated in Query: " );
    }
  }
  else if (!tokenResponse || !tokenResponse.token) {
    // There is no system sotred user token, so the user has not signed in yet.
    // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions

    cache.set(context.activity.from.id, cacheInitFlag);

    return {
      composeExtension: {
        type: 'auth',
        suggestedActions: {
          actions: [
            {
              type: 'openUrl',
              value: signInLink,
              title: 'Bot Service OAuth'
            },
          ],
        },
      },
    };
  }
    switch (query.commandId) {
      //call the relevant function to handle the query
      case searchIncident.COMMAND_ID:
        //call the searchIncident function to get the incident details
        return searchIncident.handleTeamsMessagingExtensionQuery(context, query,tokenResponse.token,"number");
      case "getIncidentListByShortDescription":
        return searchIncident.handleTeamsMessagingExtensionQuery(context, query,tokenResponse.token,"short_description");
      case "getIncidentListByAssignedTo":
        return searchIncident.handleTeamsMessagingExtensionQuery(context, query,tokenResponse.token,"assigned_to");
      case updateIncident.COMMAND_ID:{
        return updateIncident.handleTeamsMessagingExtensionQuery(context, query,tokenResponse.token);
      }
      default:
        throw new Error("NotImplemented");
    }
  }

async onInvokeActivity (context) {
// async onAdaptiveCardInvoke(context, invokeValue) {

  console.log('\r\nonAdaptiveCardInvoke, ');
  let runEvents = true;
  try {

    const valueObj = context.activity.value;
    if (valueObj.authentication) {
        const authObj = valueObj.authentication;
        if (authObj.token) {
            // If the token is NOT exchangeable, then do NOT deduplicate requests.
             if (await this.tokenIsExchangeable(context)) 
             {
                 return await super.onInvokeActivity(context);
             }
             else {
                    const response = 
                    {
                    status: 412
                    };
                return response;
             }
        }
    }
    let runEvents = true;
    // console.log('\r\nContext: ',context.activity.name);
    // //   try {
    if(context.activity.name==='adaptiveCard/action'){
      switch (context.activity.value.action.verb) {
        case 'update': {
          console.log('\r\nupdate incident');
          return updateIncident.updateIncident(context.activity.value.action.data, cache.get(context.activity.from.id));
          // return actionHandler.handleTeamsCardActionUpdateIncident(context);
        }
        case 'refresh': {
          return searchIncident.searchIncidentRefresh(context, context.activity.value.action.data,cache.get(context.activity.from.id));
          // return actionHandler.handleTeamsCardActionUpdateIncident(context);
        }
        default:
          runEvents = false;
          return super.onInvokeActivity(context);
      }
      } else {
          runEvents = false;
          return super.onInvokeActivity(context);
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'NotImplemented') {
        return { status: 501 };
      } else if (err.message === 'BadRequest') {
        return { status: 400 };
      }
      throw err;
    }finally {
      if (runEvents) {
        this.defaultNextEvent(context)();
        // return { status: 200 };
      }
    }
}

}
module.exports.SearchApp = SearchApp;

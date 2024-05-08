const axios = require("axios");
const { TeamsActivityHandler, CardFactory,TurnContext, MessageFactory } = require("botbuilder");
const ACData = require("adaptivecards-templating");
const SNIncidentsUpdatedCard = require("./adaptiveCards/SNIncidentsUpdatedCard.json");
const { baseURL } = require("./config");
const COMMAND_ID = "updateIncidentDetails";
const { CreateInvokeResponse, CreateAdaptiveCardInvokeResponse } = require("./adaptiveCards/utils");
let resultCard, attachment = '';
// class UpdateIncident extends TeamsActivityHandler {
//   constructor() {
//     super();
//   }

  // Message extension Code
  // Search.
  async function handleTeamsMessagingExtensionQuery(context, query, accessToken) {
    const searchQuery = query.parameters[0].value;
    let incidentParam, short_descriptionParam,assigned_toParam, searchParameter, searchValue='';

    try {
      incidentParam = query.parameters.find(p => p.name === 'incident_no').value;
      if (incidentParam) {
        searchParameter='number'
        searchValue=incidentParam 
      }
      short_descriptionParam = query.parameters.find(p => p.name === 'short_description');
      if (short_descriptionParam) {
        searchParameter='short_description'
        searchValue=short_descriptionParam
      }
      assigned_toParam = query.parameters.find(p => p.name === 'assigned_to').value;
      if (assigned_toParam) {
        searchParameter='assigned_to'
        searchValue=assigned_toParam
      }
      console.log(query.commandId);
    } catch (error) {
      console.log('value not found for few variables');
    }
    if (incidentParam && incidentParam.length === 10){

    //read incident number from the query & update the incident
    //first perform get operation to fetch sys_id of incident
    //then perform put operation to update the incident with user input
    // let readConfig = {
    //   method: 'get',
    //   maxBodyLength: Infinity,
    //   url: baseURL+'?sysparm_limit=4&sysparm_query='+searchParameter+'LIKE' + searchValue,
    //   // url: 'https://ven01957.service-now.com/api/now/table/incident?sysparm_limit=4&sysparm_query=assigned_to.nameLIKEAlex',
    //   headers: { 
    //     'Authorization': bearerToken, 
    //     'Cookie': cookie
    //     },
    // };
    let readConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url: baseURL+'api/now/v1/table/incident?sysparm_limit=4&sysparm_query='+searchParameter+'LIKE' + searchValue,
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'Cookie': ''    
      },
    };

    try
    {
    const readResponse = await axios.request(readConfig);
    const sys_id = readResponse.data.result[0].sys_id;
    const short_description = readResponse.data.result[0].short_description;
    // console.log(JSON.stringify(response.data));
  
    let data = JSON.stringify({
      "short_description": "test"+short_description
    });
    // console.log(JSON.stringify(response.data));
    let updateConfig = {
      method: 'put',
      maxBodyLength: Infinity,
      url: baseURL+"api/now/v1/table/incident/"+sys_id+'?sysparm_exclude_ref_link=true',
      // https://instance.service-now.com/api/now/v1/table/incident/{sys_id}?sysparm_exclude_ref_link=true
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, 
        'Cookie': ''
        },
      data : data
    };  
    const response = await axios.request(updateConfig);
    console.log(response)
    }
    catch(error) {
      console.log(error);
    };
  }
  }

 async function updateIncident(Incident, accessToken){
  console.log('\r\nInside Update Incident',Incident);
  let jsonObject={};
  try
  {
  // const readResponse = await axios.request(readConfig);
  // const sys_id = readResponse.data.result[0].sys_id;
  if (Incident.description) {
    jsonObject["short_description"] = Incident.description; 
    }
  if (Incident.priority) {
    jsonObject["priority"] = Incident.priority; 
    }
  // console.log(JSON.stringify(response.data));
  let data = JSON.stringify(jsonObject);
  // console.log(JSON.stringify(jsonObject));
  let updateConfig = {
    method: 'put',
    maxBodyLength: Infinity,
    // url: baseURL+"/"+Incident.sys_id+'?sysparm_exclude_ref_link=true',
    url: baseURL+"api/now/v1/table/incident/"+Incident.sys_id+'?sysparm_exclude_ref_link=true',
    // https://instance.service-now.com/api/now/v1/table/incident/{sys_id}?sysparm_exclude_ref_link=true
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, 
      'Cookie': ''
      },
    data : data
  };  
  const response = await axios.request(updateConfig);
  console.log('\r\nresponse.status: ',response.status)
    if (response.status === 200){
    //populate response card
    const template = new ACData.Template(SNIncidentsUpdatedCard);
    const resultCard = template.expand({
          $root: {
            number: Incident.number,
            short_description: data.short_description||Incident.short_description,
            priority: data.priority||Incident.priority,
            link: baseURL+'/incident.do?sysparm_query=number='+Incident.number,
            sys_id: Incident.sys_id,
            severity: Incident.severity,
            description: Incident.description,
            sys_created_by: Incident.sys_created_by,
            sys_created_on: Incident.sys_created_on,
            sys_updated_by: Incident.sys_updated_by
          },
          });
    // return {status: true, message: "Incident updated successfully"};
    // return CreateAdaptiveCardInvokeResponse(200, resultCard);
    var responseBody = { statusCode: 200, type: 'application/vnd.microsoft.card.adaptive', value: resultCard }
    console.log('\r\rresponseBody: ', responseBody)
    return CreateInvokeResponse(responseBody);
  }
  else{ 
    return {status: false, message: "Incident not updated"};
  }
  }catch(error) {
    console.log(error);
  }
 }

module.exports = { COMMAND_ID, handleTeamsMessagingExtensionQuery, updateIncident };

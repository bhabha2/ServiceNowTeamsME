const axios = require("axios");
const { TeamsActivityHandler, CardFactory } = require("botbuilder");
const ACData = require("adaptivecards-templating");
// const helloWorldCard = require("./adaptiveCards/helloWorldCard.json");
const SNIncidents = require("./adaptiveCards/SNIncidents.json");
const { baseURL, fieldsToBeExtracted,sysparmLimit } = require("./config");
// const {getEditCard} = require("./adaptiveCards/cardHandler");
const COMMAND_ID = "getIncidentDetails";
const { CreateInvokeResponse, CreateAdaptiveCardInvokeResponse } = require("./adaptiveCards/utils");

let resultCard = '';
  // Message extension Code
  // define function to search incident

  async function handleTeamsMessagingExtensionQuery(context, query,accessToken,param) {
    // Add your code here
    // const searchQuery = query.parameters[0].value;
    let incidentParam, short_descriptionParam,assigned_toParam, searchParameter, searchValue='';
    // look for 'incident_no', 'short_description' and 'assigned_to' in query and assign the value to SearchParameter and SearchValue
    
  let readQuery = '';

    searchValue = query.parameters.find((element) => element.name === "searchValue")?.value||'';
    // switch (param) {
    //   case 'number','short_description','assigned_to','severity':
        readQuery+='^'+param+'LIKE' + searchValue;
    // }
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: baseURL+'api/now/v1/table/incident?sysparm_limit=10&sysparm_query='+readQuery+'&sysparm_fields='+fieldsToBeExtracted,
      headers: { 
        'Authorization': `Bearer ${accessToken}`, 
        'Cookie': ''    
      },
    };
        // console.log(readQuery);
        // console.log(config.url);
        try
        {
        const response = await axios.request(config);
        // console.log(JSON.stringify(response.data));

      const attachments = [];
      response.data.result.forEach((result) => {
        //
        const template = new ACData.Template(SNIncidents);
        const resultCard = template.expand({
          $root: {
            number: result.number,
            short_description: result.short_description,
            priority: result.priority,
            link: baseURL+'/incident.do?sysparm_query=number='+result.number,
            sys_id: result.sys_id,
            severity: result.severity,
            description: result.description,
            sys_created_by: result.sys_created_by,
            sys_created_on: result.sys_created_on,
            sys_updated_by: result.sys_updated_by,
          },
          });
        //
          const preview = CardFactory.heroCard(result.number);
          const attachment = { ...CardFactory.adaptiveCard(resultCard), preview };
          attachments.push(attachment);
      });

      return {
        composeExtension: {
          type: "result",
          attachmentLayout: "list",
          attachments: attachments,
        },
      };

    // })
    }
    catch(error) {
      console.log(error);
    };
}

async function searchIncidentRefresh(context, query,accessToken) {
  console.log('\r\n Inside searchIncidentRefresh');
  // Add your code here
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: baseURL+'api/now/v1/table/incident?sysparm_limit=10&sysparm_query=^numberLIKE'+query.number+'&sysparm_fields='+fieldsToBeExtracted,
    headers: { 
      'Authorization': `Bearer ${accessToken}`, 
      'Cookie': ''    
    },
  };
          // console.log('\r\nquery.number: ',baseURL+'?sysparm_limit='+sysparmLimit+'&number='+query.number+'&sysparm_fields='+fieldsToBeExtracted,);
      try
      {
      const response = await axios.request(config);
      // console.log('\r\n',JSON.stringify(response.data));

    response.data.result.forEach((result) => {
      //
      const template = new ACData.Template(SNIncidents);
      resultCard = template.expand({
        $root: {
          number: result.number,
          short_description: result.short_description,
          priority: result.priority,
          link: 'https://ven01957.service-now.com/incident.do?sysparm_query=number='+result.number,
          sys_id: result.sys_id,
          // severity: result.severity,
          severity: 5,
          description: result.description,
          sys_created_by: result.sys_created_by,
          sys_created_on: result.sys_created_on,
          sys_updated_by: result.sys_updated_by,
        },
        });
    });
         //var responseBody = { "statusCode": 200, "type": "application/vnd.microsoft.card.adaptive", "value": card };
        //  var responseBody = { statusCode: 200, type: 'application/vnd.microsoft.card.adaptive', value: resultCard }
        //  console.log('\r\nresponseBody: ', responseBody)
        //  return CreateInvokeResponse(responseBody);
        return CreateAdaptiveCardInvokeResponse(200, resultCard);

  }
  catch(error) {
    console.log(error);
  }
}

module.exports ={ COMMAND_ID, handleTeamsMessagingExtensionQuery, searchIncidentRefresh };

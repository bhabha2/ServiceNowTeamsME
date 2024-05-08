const {TurnContext, CardFactory} = require("botbuilder");
const SNIncidents = require("./SNIncidents.json");
const successCard = require ("./successCard.json");
const errorCard = require ("./errorCard.json");
const ACData = require ("adaptivecards-templating");
// const searchIncident = require("./SearchIncident");

const { CreateInvokeResponse, getInventoryStatus } = require("./utils");

function getEditCard(result) {

    var template = new ACData.Template(SNIncidents);
    var card = template.expand({
        $root: {
            number: result.number,
            short_description: result.short_description,
            severity: result.severity,
            link: 'https://ven01957.service-now.com/incident.do?sysparm_query=number='+result.number,
          },
    });
    return CardFactory.adaptiveCard(card);
}


async function handleTeamsCardActionUpdateIncident(context) {

    const request = context.activity.value;
    const data = request.action.data;
    console.log(`🎬 Handling update Incident action, severity=${data.severity}`);
    console.log(`🎬 Handling update Incident action, description=${data.description}`);

    if (data.severity || data.description) {
        
        const Incident = await getProductEx(data.sys_id);
        Incident.severity = Number(data.severity);
        Incident.description = data.description;
        await updateIncident(Incident);
        
        var template = new ACData.Template(successCard);
        var card = template.expand({
            $root: {
                number: result.number,
                short_description: result.short_description,
                severity: result.severity,
                link: 'https://ven01957.service-now.com/incident.do?sysparm_query=number='+result.number,
                // Card message
                message: `Incident Severity updated from ${Incident.Severity} for ${Incident.number}!`
            }
        });
        var responseBody = { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: card }
        return CreateInvokeResponse(responseBody);

    } else {
        var errorBody = { statusCode: 200, type: "application/vnd.microsoft.card.adaptive", value: errorCard }
        return CreateInvokeResponse(errorBody);
    }
}

module.exports = { getEditCard, handleTeamsCardActionUpdateIncident };
// import { Product } from "../northwindDB/model";
const {AdaptiveCardInvokeResponse, InvokeResponse} = require("botbuilder");
const CreateInvokeResponse = (body) => {
    console.log('\r\n🎬 CreateInvokeResponse: ', body);
    return { status: 200, body }
}

function CreateAdaptiveCardInvokeResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        type: "application/vnd.microsoft.card.adaptive",
        value: body
    };
}

function CreateActionErrorResponse ( statusCode, errorCode, errorMessage) {
    console.log('\r\n error occurred...');
    return {
        statusCode: statusCode,
        type: 'application/vnd.microsoft.error',
        value: {
            error: {
                code: errorCode,
                message: errorMessage,
            },
        },
    };
  }
module.exports ={ CreateInvokeResponse, CreateAdaptiveCardInvokeResponse,CreateActionErrorResponse};
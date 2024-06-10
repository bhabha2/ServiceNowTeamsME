# Overview of Custom Search Results template

This app template is a search-based [message extension](https://docs.microsoft.com/microsoftteams/platform/messaging-extensions/what-are-messaging-extensions?tabs=nodejs) that allows users to search an external system and share results through the compose message area of the Microsoft Teams client. You can now build and run your search-based message extensions in Teams, Copilot for Windows desktop and web experiences.

## Get started with the template

> **Prerequisites**
>
> To run the template in your local dev machine, you will need:
>
> - [Node.js](https://nodejs.org/), supported versions: 16, 18
> - A [Microsoft 365 account for development](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts)
> - ServiceNow Admin to configure the integration.
> - ServiceNow User account to login to the plugin from Microsoft 365 Copilot and search for information. 
> - [Set up your dev environment for extending Teams apps across Microsoft 365](https://aka.ms/teamsfx-m365-apps-prerequisites)
>   Please note that after you enrolled your developer tenant in Office 365 Target Release, it may take couple days for the enrollment to take effect.
> - [Teams Toolkit Visual Studio Code Extension](https://aka.ms/teams-toolkit) version 5.0.0 and higher or [Teams Toolkit CLI](https://aka.ms/teamsfx-cli)
> - Join Microsoft 365 Copilot Plugin development [early access program](https://aka.ms/plugins-dev-waitlist).

ServiceNow (Admin login):
1. Login to ServiceNow and goto System OAuth - Application Registry and create new OAuth entry-

 ![alt text](image-1.png)
 ![alt text](image-2.png)
 ![alt text](image-3.png)
 ![alt text](image-4.png)
 Note down the Client ID & Secret. We will need this while configuration the OAuth connection in Azure.

Using Visual Studio:
2. Select the Teams Toolkit icon on the left in the VS Code toolbar.  
3. In the Account section, sign in with your [Microsoft 365 account](https://docs.microsoft.com/microsoftteams/platform/toolkit/accounts) if you haven't already.  
4. Go to src\Config.js and modify the baseURL to point to your instance of ServiceNow.  
5. Login to Azure & create a resource group to deploy the solution. Copy the tenant-id and resource group name.  
6. In Visual studio, create a .env.dev file under env folder & enter the values copied above. 

>sample entries (remove * while saving .env.dev file)  
`# This file includes environment variables that will be committed to git by default`.  
`# Built-in environment variables`  
`TEAMSFX_ENV=dev`  
`APP_NAME_SUFFIX=dev`  
`AZURE_SUBSCRIPTION_ID=`  
`AZURE_RESOURCE_GROUP_NAME=`  
`RESOURCE_SUFFIX=`  
![alt text](image-6.png)
7. Using the Teams Toolkit menu, under Lifecycle - choose each of the options Provision & Deploy sequentially. This will create the necessary configuration and deploy the app & bot in Azure within the Resource group created in step 5 above.  
8. Once the deployment is successfully completed, login to Azure and click on the bot under the resource group.  
![alt text](image-7.png) 
Select Configuration & click on Add OAuth Connection Settings to enter the OAuth Connection details created in Step 1.  
![alt text](image-8.png)
![alt text](SNOAuth-Step8.png)
>For the _Authorization URL_ use: Use https://<your ServiceNow instance url>/oauth_auth.do  
>For the _Token URL, Refresh URL & Token Exchange URL_ use Use https://<your ServiceNow instance url>/oauth_token.do

Copy the bot, password & the OAuth Connection Name   
9. Create .env file under the src folder and update the bot Id, password & the OAuth Connection Name:  
`MicrosoftAppId=`  
`MicrosoftAppPassword=`  
`connectionName=`  
`SiteUrl=`  
![alt text](image-5.png)
10. Redeploy the solution using the deploy option from the Teams toolkit.  
11. Click on Publish option from the Teams toolkit to create the App Package file.  
12. Using a Teams environment with access to upload custom apps, upload the app package found appPackage\build folder.  
![alt text](image-9.png)
13. To trigger the app as Message Extension, `@mention` Your message extension from the `search box area`, `@mention` your message extension from the `compose message area` or click the `...` under compose message area to find your message extension.  
14. To trigger the Message Extension through Copilot as a Plugin, you can:   
   a. Open the `Copilot` app and enable the plugin from Plugin popup list.   
   b. send a prompt to trigger your plugin.
   > Note: This prompt may not always make Copilot include a response from your message extension. If it happens, try some other prompts or leave a feedback to us by thumbing down the Copilot response and leave a message tagged with [MessageExtension].

**Congratulations**! You can now search ServiceNow incidents in Teams and Copilot.

![Search ME Copilot](https://github.com/OfficeDev/TeamsFx/assets/107838226/a718b206-33ed-4d3e-99af-376c1f159c2b)

## What's included in the template

| Folder        | Contents                                     |
| ------------- | -------------------------------------------- |
| `.vscode/`    | VSCode files for debugging                   |
| `appPackage/` | Templates for the Teams application manifest |
| `env/`        | Environment files                            |
| `infra/`      | Templates for provisioning Azure resources   |
| `src/`        | The source code for the search application   |

The following files can be customized and demonstrate an example implementation to get you started.

| File               | Contents                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `src/searchApp.js` | Handles the business logic for this app template to query npm registry and return result list. |
| `src/index.js`     | `index.js` is used to setup and configure the Message Extension.                               |

The following are Teams Toolkit specific project files. You can [visit a complete guide on Github](https://github.com/OfficeDev/TeamsFx/wiki/Teams-Toolkit-Visual-Studio-Code-v5-Guide#overview) to understand how Teams Toolkit works.

| File                 | Contents                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `teamsapp.yml`       | This is the main Teams Toolkit project file. The project file defines two primary things: Properties and configuration Stage definitions. |
| `teamsapp.local.yml` | This overrides `teamsapp.yml` with actions that enable local execution and debugging.                                                     |

## Extend the template

Following documentation will help you to extend the template.

- [Add or manage the environment](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-multi-env)
- [Create multi-capability app](https://learn.microsoft.com/microsoftteams/platform/toolkit/add-capability)
- [Add single sign on to your app](https://learn.microsoft.com/microsoftteams/platform/toolkit/add-single-sign-on)
- [Access data in Microsoft Graph](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-sdk#microsoft-graph-scenarios)
- [Use an existing Microsoft Entra application](https://learn.microsoft.com/microsoftteams/platform/toolkit/use-existing-aad-app)
- [Customize the Teams app manifest](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-preview-and-customize-app-manifest)
- Host your app in Azure by [provision cloud resources](https://learn.microsoft.com/microsoftteams/platform/toolkit/provision) and [deploy the code to cloud](https://learn.microsoft.com/microsoftteams/platform/toolkit/deploy)
- [Collaborate on app development](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-collaboration)
- [Set up the CI/CD pipeline](https://learn.microsoft.com/microsoftteams/platform/toolkit/use-cicd-template)
- [Publish the app to your organization or the Microsoft Teams app store](https://learn.microsoft.com/microsoftteams/platform/toolkit/publish)
- [Develop with Teams Toolkit CLI](https://aka.ms/teamsfx-cli/debug)
- [Preview the app on mobile clients](https://github.com/OfficeDev/TeamsFx/wiki/Run-and-debug-your-Teams-application-on-iOS-or-Android-client)
- [Extend Microsoft 365 Copilot](https://aka.ms/teamsfx-copilot-plugin)

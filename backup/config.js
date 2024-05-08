const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  authURL: 'https://ven01957.service-now.com/oauth_token.do',
  client_id:'44095b28b064ca502e676bbbe1cbea04',
  client_secret:'WjO[6ZO[6e',
  user_name: 'AlexW@M365x36224030.OnMicrosoft.com',
  password: '$m@rtPrompt#123',
  baseURL: 'https://ven01957.service-now.com/api/now/v1/table/incident', 
  bearerToken: 'Bearer iGq3xADdDJuBvunikIf963B9G0OUwyLNlzGaLkmklADFvfjvQycr-L9hlONppBJpgQNUcX9btfxVD0Vf-RpdOA',
  cookie: 'BIGipServerpool_ven01957=6ed58969755b7c3607624895d671588d; JSESSIONID=0852563FC5176307A9B6AC86943BBE54; glide_node_id_for_js=39023b18d943f4443e8ae910a9bddcad2499bee455691f66513ffe07df02a707; glide_session_store=E1E060021BE00690E1068622DD4BCB2B; glide_user_route=glide.6a5720c2ae15733b0678f7a788ffd602',
  sysparmLimit: 10,
  fieldsToBeExtracted: 'number,assigned_to,short_description,sys_id,description, severity,priority,active,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,work_notes',

};

module.exports = config;

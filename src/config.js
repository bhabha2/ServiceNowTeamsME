const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  baseURL: 'https://ven01957.service-now.com/', 
  sysparmLimit: 10,
  fieldsToBeExtracted: 'number,assigned_to,short_description,sys_id,description, severity,priority,active,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,work_notes',

};

module.exports = config;

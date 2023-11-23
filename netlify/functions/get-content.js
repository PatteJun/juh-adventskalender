const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters;

  // Return early if there is no ID
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No ID provided.' }),
    };
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('apppi8vcU0MF25dgl');
  const table = base('Doors');

  try {
    const record = await table.find(id);
    // Return the entire record for simplicity, you can structure this as you need
    return {
      statusCode: 200,
      body: JSON.stringify(record),
    };
  } catch (error) {
    // If the record is not found or another error occurs
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Content not found.' }),
    };
  }
};

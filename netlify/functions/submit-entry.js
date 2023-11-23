const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, raffle } = JSON.parse(event.body);
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('apppi8vcU0MF25dgl');
  const table = base('Participants');

  try {
    // Create a new record in the 'Participants' table
    const createdRecord = await table.create({
      'Email Address': email,
      'Raffle': raffle
    });

    return {
      statusCode: 200,
      body: JSON.stringify(createdRecord)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save entry' })
    };
  }
};

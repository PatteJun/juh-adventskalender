const Airtable = require('airtable');
const { DateTime } = require('luxon');

exports.handler = async function(event, context) {
  // Your Airtable base and table setup
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('apppi8vcU0MF25dgl');
  const table = base('Doors');

  // Get the door number from the request
  const doorNumber = event.queryStringParameters.door;

  // Get the current date in the German time zone
  const currentDate = DateTime.now().setZone('Europe/Berlin');
  const currentDay = currentDate.day;

  // Check if the door number is the current day
  if (parseInt(doorNumber) === currentDay) {
    try {
      // Find the row in Airtable where 'Door Number' matches today's date
      const records = await table.select({
        filterByFormula: `{Door Number} = "${currentDay}"`
      }).firstPage();

      if (records.length > 0) {
        // Return the Airtable row ID of today's content
        return {
          statusCode: 200,
          body: JSON.stringify({ id: records[0].id })
        };
      } else {
        // No content found for today's door number
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Kein Inhalt für die heutige Tür gefunden.' })
        };
      }
    } catch (error) {
      // Handle any other errors
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Serverfehler bei der Verarbeitung Ihrer Anfrage.' })
      };
    }
  } else {
    // If the door number is not today's date, return an error
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Dies ist nicht die Tür des Tages.' })
    };
  }
};

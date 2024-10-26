const Airtable = require('airtable');
const { DateTime } = require('luxon');

exports.handler = async function(event, context) {
  // Your Airtable base and table setup
  const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN }).base('apppi8vcU0MF25dgl');
  const doorsTable = base('Doors');
  const messagesTable = base('Messages');

  // Get the door number from the request
  const doorNumber = event.queryStringParameters.door;

  // Get the current date in the German time zone
  const currentDate = DateTime.now().setZone('Europe/Berlin');
  const currentDay = currentDate.day;
  const currentMonth = currentDate.month;

  console.log(`Checking door number: ${doorNumber} on date: ${currentDate.toISODate()}`);

  // Check if it's before December 1st
  if (currentMonth < 12 || (currentMonth === 12 && currentDay < 1)) {
    console.log('Before December 1st, fetching before_start message.');
    return await getRandomMessage(messagesTable, 'before_start');
  }

  // Check if the door number is the current day
  if (parseInt(doorNumber) === currentDay) {
    try {
      // Find the row in Airtable where 'Door Number' matches today's date
      const records = await doorsTable.select({
        filterByFormula: `{Door Number} = "${currentDay}"`
      }).firstPage();

      if (records.length > 0) {
        console.log('Found record for today\'s door.');
        // Return the Airtable row ID of today's content
        return {
          statusCode: 200,
          body: JSON.stringify({ id: records[0].id })
        };
      } else {
        console.log('No content found for today\'s door number.');
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Kein Inhalt für die heutige Tür gefunden.' })
        };
      }
    } catch (error) {
      console.error('Error fetching door content:', error);
      // Handle any other errors
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Serverfehler bei der Verarbeitung Ihrer Anfrage.' })
      };
    }
  } else {
    console.log('Door number does not match today, fetching wrong_day message.');
    return await getRandomMessage(messagesTable, 'wrong_day');
  }
};

async function getRandomMessage(messagesTable, type) {
  try {
    const records = await messagesTable.select({
      filterByFormula: `{Type} = "${type}"`
    }).all();

    if (records.length > 0) {
      const randomIndex = Math.floor(Math.random() * records.length);
      const message = records[randomIndex].get('Message');
      console.log(`Fetched random message: ${message}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: message })
      };
    } else {
      console.log('No messages found for type:', type);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Keine Nachricht gefunden.' })
      };
    }
  } catch (error) {
    console.error('Error fetching message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fehler beim Abrufen der Nachricht.' })
    };
  }
}

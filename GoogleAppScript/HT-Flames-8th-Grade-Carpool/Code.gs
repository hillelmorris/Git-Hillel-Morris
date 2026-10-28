// ==========================================
// CONFIGURATION & TESTING SETTINGS
// ==========================================
// Set to 'true' to test with a fake date, or 'false' for live/daily trigger use.
const TEST_MODE = true; 

// When TEST_MODE is true, this date simulates "today".
// The script will look for carpool events on the FOLLOWING day ("tomorrow").
// Example: '2027-01-05' simulates today as Jan 5, so it sends reminders for Jan 6.
const TEST_DATE = '2026-10-26'; 


/**
 * MAIN FUNCTION: Runs daily via trigger OR during testing.
 */
function sendTomorrowDriverReminders() {
  let simulatedToday;

  if (TEST_MODE) {
    simulatedToday = new Date(TEST_DATE + 'T00:00:00');
    Logger.log(`[TEST MODE ACTIVE] Simulating today as: ${TEST_DATE}`);
  } else {
    simulatedToday = new Date();
  }

  // Calculate target "tomorrow" date
  const targetTomorrow = new Date(simulatedToday);
  targetTomorrow.setDate(targetTomorrow.getDate() + 1);
  targetTomorrow.setHours(0, 0, 0, 0);

  Logger.log(`Looking for events on target date: ${targetTomorrow.toDateString()}`);

  runReminderLogicForDate(targetTomorrow);
}


/**
 * DEDICATED TEST FUNCTION: 
 * Select and run this function directly from the editor toolbar to quickly test.
 */
function testRemindersForDate() {
  const simulatedToday = new Date(TEST_DATE + 'T00:00:00');
  const targetTomorrow = new Date(simulatedToday);
  targetTomorrow.setDate(targetTomorrow.getDate() + 1);
  targetTomorrow.setHours(0, 0, 0, 0);

  Logger.log(`[MANUAL TEST RUN] Simulating today as: ${TEST_DATE}`);
  Logger.log(`Looking for events on target date: ${targetTomorrow.toDateString()}`);

  runReminderLogicForDate(targetTomorrow);
}


/**
 * CORE LOGIC
 */
function runReminderLogicForDate(targetTomorrowDate) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // 1. Build Driver Contact Lookup from Rows 2 to 6
  const driverEmailsMap = {};
  for (let r = 1; r <= 5; r++) {
    const lastName = data[r][0] ? String(data[r][0]).trim() : '';
    const rawEmails = data[r][1] ? String(data[r][1]).trim() : '';
    if (lastName && rawEmails) {
      const emailArray = rawEmails.split(/[;,]/).map(e => e.trim()).filter(e => e.length > 0);
      driverEmailsMap[lastName.toLowerCase()] = emailArray;
    }
  }

  // 2. Loop through Schedule Rows (starting at Row 9, index 8)
  for (let i = 8; i < data.length; i++) {
    const row = data[i];
    const gameDateRaw = row[0];
    if (!gameDateRaw) continue;

    const eventDate = new Date(gameDateRaw);
    if (isNaN(eventDate.getTime())) continue;
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === targetTomorrowDate.getTime()) {
      const startTimeRaw   = row[1];
      const endTimeRaw     = row[2];
      const eventType      = row[3] ? String(row[3]).trim() : '';
      const sheetTitle     = row[4] ? String(row[4]).trim() : '';
      const dropOff        = row[5] ? String(row[5]).trim() : '';
      const pickUp         = row[6] ? String(row[6]).trim() : '';
      const address        = row[7] || '';

      const formattedStartTime = formatTime(startTimeRaw);
      const formattedEndTime   = formatTime(endTimeRaw);
      const formattedDate      = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy');

      // Determine Event Title based on Practice vs Game
      let displayEvent = '';
      if (eventType.toLowerCase() === 'practice') {
        displayEvent = '8th Grade Boys Practice';
      } else if (eventType) {
        displayEvent = `${eventType} ${sheetTitle}`;
      } else {
        displayEvent = sheetTitle;
      }

      // Map roles for drivers assigned to this event
      const driverAssignments = {};

      if (dropOff && dropOff.toUpperCase() !== 'N/A') {
        const key = dropOff.toLowerCase();
        driverAssignments[key] = driverAssignments[key] || [];
        driverAssignments[key].push('Drop Off');
      }

      if (pickUp && pickUp.toUpperCase() !== 'N/A') {
        const key = pickUp.toLowerCase();
        driverAssignments[key] = driverAssignments[key] || [];
        driverAssignments[key].push('Pick Up');
      }

      // Send emails to assigned families
      for (const [driverKey, roles] of Object.entries(driverAssignments)) {
        const emailList = driverEmailsMap[driverKey];
        const driverName = driverKey.charAt(0).toUpperCase() + driverKey.slice(1);

        if (!emailList || emailList.length === 0) {
          Logger.log(`No email found for family: ${driverName}`);
          continue;
        }

        const roleText = roles.join(' & ');

        // Calculate specific time responsibility
        let assignedTimeText = '';
        const isDropOff = roles.includes('Drop Off');
        const isPickUp  = roles.includes('Pick Up');

        if (isDropOff && isPickUp) {
          assignedTimeText = `${formattedStartTime} - ${formattedEndTime} (Drop Off & Pick Up)`;
        } else if (isDropOff) {
          assignedTimeText = `${formattedStartTime} (Drop Off)`;
        } else if (isPickUp) {
          assignedTimeText = `${formattedEndTime} (Pick Up)`;
        }

        const subject = `HT Flames Carpool Reminder: ${roleText} for Tomorrow's ${displayEvent}`;
        const message = `Hi ${driverName} family,\n\n` +
                        `This is a reminder you are scheduled to drive tomorrow's basketball carpool:\n\n` +
                        `• Event: ${displayEvent}\n` +
                        `• Date: ${formattedDate}\n` +
                        `• Time: ${assignedTimeText}\n` +
                        `• Address: ${address}\n\n` +
                        `Thank you!`;

        emailList.forEach(email => {
          try {
            MailApp.sendEmail(email, subject, message);
            Logger.log(`Successfully sent email to ${email}`);
          } catch (error) {
            Logger.log(`Failed to send email to ${email}: ${error.toString()}`);
          }
        });
      }
    }
  }
}


/**
 * Robust time formatting helper function
 */
function formatTime(timeVal) {
  if (!timeVal && timeVal !== 0) return '';

  if (timeVal instanceof Date) {
    return Utilities.formatDate(timeVal, Session.getScriptTimeZone(), 'h:mm a');
  }

  const strVal = String(timeVal).trim();

  if (strVal.includes('1899') || strVal.includes('GMT')) {
    const parsedDate = new Date(strVal);
    if (!isNaN(parsedDate.getTime())) {
      return Utilities.formatDate(parsedDate, Session.getScriptTimeZone(), 'h:mm a');
    }
  }

  if (!isNaN(strVal) && strVal !== '') {
    const totalMinutes = Math.round(Number(strVal) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${period}`;
  }

  return strVal;
}
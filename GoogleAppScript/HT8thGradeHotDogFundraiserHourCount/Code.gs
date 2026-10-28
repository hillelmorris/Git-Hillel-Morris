function sendHoursSummaryEmails() {
  // SET THIS TO YOUR TEST EMAIL FOR TESTING FIRST
  // Set to null or "" when you are ready to send to everyone (e.g., var TARGET_EMAIL = null;)
  // var TARGET_EMAIL = "hillel.morris@gmail.com"; 
  var TARGET_EMAIL = null; 


  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  var data = sheet.getDataRange().getValues();
  
  var peopleMap = {};

  // Group data by Email / Name
  for (var i = 1; i < data.length; i++) {
    var email = data[i][1] ? data[i][1].toString().trim() : "";
    var name = data[i][2] ? data[i][2].toString().trim() : "Volunteer";
    var dateVal = data[i][3];
    var task = data[i][4];
    var hours = parseFloat(data[i][5]) || 0;

    if (!email) continue; // Skip entries without an email address

    // IF TARGET_EMAIL is set, ignore all other emails
    if (TARGET_EMAIL && email.toLowerCase() !== TARGET_EMAIL.toLowerCase()) {
      continue;
    }

    if (!peopleMap[email]) {
      peopleMap[email] = {
        name: name,
        totalHours: 0,
        entries: []
      };
    }

    // Format date string
    var formattedDate = (dateVal instanceof Date) 
      ? Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "MM/dd/yyyy") 
      : dateVal;

    peopleMap[email].totalHours += hours;
    peopleMap[email].entries.push({
      date: formattedDate,
      task: task,
      hours: hours
    });
  }

  // Check if any entries matched
  if (Object.keys(peopleMap).length === 0) {
    Logger.log("No records found for target email: " + TARGET_EMAIL);
    return;
  }

  // Iterate over matching people and send email
  for (var emailAddress in peopleMap) {
    var person = peopleMap[emailAddress];
    
    var subject = "Hours Worked Summary - 8th Grade HT Class Fundraiser";
    
    var body = "Hi " + person.name + ",\n\n" +
               "Thank you for your help with the HT 8th Grade Class Fundraiser! Here is a breakdown of your recorded hours:\n\n";

    person.entries.forEach(function(entry) {
      body += "• Date: " + entry.date + " | Task: " + entry.task + " | Hours: " + entry.hours + "\n";
    });

    body += "\n----------------------------------------\n" +
            "Total Hours Worked: " + person.totalHours.toFixed(2) + " hrs\n" +
            "----------------------------------------\n\n" +
            "Please let us know if you have any questions or corrections.\n\n" +
            "Best regards,\n" +
            "Hillel Morris and Sarah Gryka\n" +
            "Co-chairs, Hillel Torah 8th Grade Hot Dog Lunch Fundraiser\n";

    // Send the email
    GmailApp.sendEmail(emailAddress, subject, body);
    Logger.log("Test email sent to: " + emailAddress + " (" + person.totalHours.toFixed(2) + " hrs)");
  }
  
  Logger.log("Execution completed successfully.");
}
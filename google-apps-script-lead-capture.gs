const RECIPIENT_EMAIL = "scalexis26@gmail.com";
const SPREADSHEET_NAME = "Scalexis Website Leads";
const SHEET_NAME = "Lead Submissions";
const HEADERS = ["Sr. No.", "Full Name", "Business Name", "Phone Number", "Email"];

function doGet() {
  return jsonResponse({
    success: true,
    message: "Scalexis lead capture endpoint is running.",
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const fields = event && event.parameter ? event.parameter : {};
    const lead = {
      fullName: clean(fields["Full Name"]),
      businessName: clean(fields["Business Name"]),
      phoneNumber: clean(fields["Phone Number"]),
      email: clean(fields.Email),
    };

    validateLead(lead);

    const sheet = getLeadSheet();
    ensureHeaders(sheet);

    const srNo = Math.max(1, sheet.getLastRow());
    sheet.appendRow([
      srNo,
      lead.fullName,
      lead.businessName,
      lead.phoneNumber,
      lead.email,
    ]);

    sendLeadEmail(srNo, lead);

    return jsonResponse({
      success: true,
      message: "Lead saved and emailed successfully.",
      srNo,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message || "Lead submission failed.",
    });
  } finally {
    lock.releaseLock();
  }
}

function setupLeadSheet() {
  const sheet = getLeadSheet();
  ensureHeaders(sheet);

  Logger.log(`Lead sheet ready: ${sheet.getParent().getUrl()}`);
}

function getLeadSheet() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty("LEADS_SPREADSHEET_ID");
  let spreadsheet;

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      spreadsheet = null;
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
    properties.setProperty("LEADS_SPREADSHEET_ID", spreadsheet.getId());
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const defaultSheet = spreadsheet.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getSheetId() !== sheet.getSheetId()) {
    spreadsheet.deleteSheet(defaultSheet);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => currentHeaders[index] === header);

  if (!hasHeaders) {
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#7261f4");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
}

function validateLead(lead) {
  const missingFields = [];

  if (!lead.fullName) missingFields.push("Full Name");
  if (!lead.businessName) missingFields.push("Business Name");
  if (!lead.phoneNumber) missingFields.push("Phone Number");
  if (!lead.email) missingFields.push("Email");

  if (missingFields.length) {
    throw new Error(`Missing required field(s): ${missingFields.join(", ")}`);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    throw new Error("Email is invalid.");
  }

  if (!/^[0-9+\-\s()]{7,20}$/.test(lead.phoneNumber)) {
    throw new Error("Phone Number is invalid.");
  }
}

function sendLeadEmail(srNo, lead) {
  const subject = `New Scalexis Website Lead #${srNo}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #111111;">
      <h2 style="margin: 0 0 16px;">New Scalexis Website Lead</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        ${emailRow("Sr. No.", srNo)}
        ${emailRow("Full Name", lead.fullName)}
        ${emailRow("Business Name", lead.businessName)}
        ${emailRow("Phone Number", lead.phoneNumber)}
        ${emailRow("Email", lead.email)}
      </table>
    </div>
  `;

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject,
    htmlBody,
    replyTo: lead.email,
  });
}

function emailRow(label, value) {
  return `
    <tr>
      <td style="border: 1px solid #dddddd; font-weight: bold;">${escapeHtml(label)}</td>
      <td style="border: 1px solid #dddddd;">${escapeHtml(String(value))}</td>
    </tr>
  `;
}

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

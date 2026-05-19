# Scalexis Lead Form Setup

The website form is ready to send leads to a Google Apps Script endpoint. The script will:

- Create a new Google Spreadsheet named `Scalexis Website Leads`
- Add the columns `Sr. No.`, `Full Name`, `Business Name`, `Phone Number`, `Email`
- Auto-fill `Sr. No.` as `1, 2, 3...`
- Email every submission to `scalexis26@gmail.com`
- Redirect the user to `thank-you.html`

## One-Time Google Setup

1. Open [Google Apps Script](https://script.google.com/).
2. Create a new project named `Scalexis Website Lead Capture`.
3. Delete the starter code and paste the full code from `google-apps-script-lead-capture.gs`.
4. Run the function `setupLeadSheet`.
5. Approve the permissions for `scalexis26@gmail.com`.
6. Open **Deploy > New deployment**.
7. Choose **Web app**.
8. Set **Execute as** to `Me`.
9. Set **Who has access** to `Anyone`.
10. Click **Deploy**.
11. Copy the Web App URL.
12. Paste that URL into `script.js` as the value of `LEAD_CAPTURE_ENDPOINT`.

After the URL is added and deployed, every valid form submission will be saved in the Google Sheet and emailed to `scalexis26@gmail.com`.

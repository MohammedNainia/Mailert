# Mailert
# Gmail to WhatsApp Alert System

This project integrates Google Gmail API and Twilio's WhatsApp API to create a real-time email alert system. Whenever a new email arrives, a WhatsApp message is sent to notify you about the new email.

## Features

- Automated monitoring of Gmail inbox for new, unread emails.
- Real-time WhatsApp notifications for each new email.
- Secure OAuth2 authentication for accessing Gmail API.
- Environment variable configuration for sensitive information.

## Prerequisites

- Node.js and npm installed
- Twilio account with WhatsApp sandbox setup
- Google Cloud project with Gmail API enabled

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/gmail-to-whatsapp-alert.git
   cd gmail-to-whatsapp-alert

2- Install dependencies:
  npm install
  
3-Create a .env file in the project root and add your credentials:

  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  WHATSAPP_FROM=whatsapp:+14093163534
  WHATSAPP_TO=whatsapp:+212617264975
  CRED_PATH=path_to_your_cred.json
  TOKEN_PATH=token.json

4-Set up Google credentials:

  Create a Google Cloud project and enable the Gmail API.
  Create OAuth2 credentials and download the credentials.json file.
  Save the credentials.json file at the location specified in your .env file.

5-Run the application:
  Run the application:



  Follow the on-screen instructions to authorize the app to access your Gmail account.

Usage
The app will check for new, unread emails every 60 seconds. When a new email is detected, a WhatsApp message with the email snippet will be sent to the specified number.

Contributing
Contributions are welcome! Please create an issue or submit a pull request for any improvements or bug fixes.

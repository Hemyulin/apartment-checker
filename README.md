# Apartment Checker

Apartment Checker is a JavaScript-based application designed to automatically scrape the [WBM Website](https://www.wbm.de) for new apartment listings every 7 minutes. 
Using the Pushover service, it sends real-time notifications to your phone, helping you stay ahead in the competitive apartment hunting process.

## Features

- **Automated Scraping**: Constant monitoring of the WBM website every 7 minutes to detect new apartment listings.
- **Real-Time Notifications**: Immediate alerts sent via Pushover directly to your mobile device upon the detection of new listings.
- **User-Friendly**: Simple setup and minimal configuration required to start receiving updates.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- npm (Node Package Manager)

Additionally, you will need:
- A Pushover account to receive push notifications ([Sign up here](https://pushover.net/))
- 
## Usage

To start the application, run:

```bash
node apartmentChecker.js

This will initiate the scraping process, and you will begin to receive notifications for new apartment listings.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.
Any contributions you make are **greatly appreciated**.

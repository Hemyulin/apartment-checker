const puppeteer = require("puppeteer");
const Pushover = require("pushover-notifications");
require("dotenv").config();

const previousOfferLinks = new Set();
const CHECK_INTERVAL = 7 * 60 * 1000; // 7 minutes

async function main() {
  while (true) {
    const currentTime = new Date().toLocaleString();
    try {
      const offers = await fetchApartmentOffers();
      if (offers.length === 0) {
        console.log(`[${currentTime}] No new apartments found.`);
      } else {
        await processOffers(offers, currentTime);
      }
    } catch (error) {
      console.error(`[${currentTime}] Error: ${error.message}`);
    }
    await delay(CHECK_INTERVAL);
  }
}

async function fetchApartmentOffers() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");
  await page.waitForTimeout(5000);

  const currentContent = await page.content();
  await browser.close();

  if (
    currentContent.includes(
      "LEIDER HABEN WIR DERZEIT KEINE VERFÜGBAREN WOHNUNGSANGEBOTE"
    )
  ) {
    return [];
  }

  return page.evaluate(() => {
    const offerElements = Array.from(
      document.querySelectorAll(".row.openimmo-search-list-item")
    );
    return offerElements.map((element) => ({
      title: element.querySelector(".imageTitle").textContent.trim(),
      address: element.querySelector(".address").textContent.trim(),
      link: element.querySelector('a[title="Details"]').getAttribute("href"),
    }));
  });
}

async function processOffers(offers, currentTime) {
  for (const offer of offers) {
    if (!previousOfferLinks.has(offer.link)) {
      const message = `${offer.title}\n${offer.address}\nLink: https://www.wbm.de${offer.link}`;
      console.log(`[${currentTime}] New apartment found: ${message}`);
      await sendNotification(message, currentTime);
      previousOfferLinks.add(offer.link);
    }
  }
}

async function sendNotification(message, currentTime) {
  const push = new Pushover({
    user: process.env.PUSHOVER_USER,
    token: process.env.PUSHOVER_TOKEN,
  });

  const notification = {
    message,
    title: "New Apartment Offer Available",
  };

  return new Promise((resolve, reject) => {
    push.send(notification, (err, result) => {
      if (err) {
        console.error(
          `[${currentTime}] Error sending notification: ${err.message}`
        );
        reject(err);
      } else {
        console.log(`[${currentTime}] Push notification sent successfully!`);
        resolve(result);
      }
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

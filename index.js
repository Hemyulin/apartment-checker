const puppeteer = require("puppeteer");
const Pushover = require("pushover-notifications");
require("dotenv").config();

let currentTime;
const previousOfferLinks = new Set();

const main = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");
    await new Promise((r) => setTimeout(r, 5000));

    currentTime = new Date().toLocaleString();

    const currentContent = await page.content();

    if (
      currentContent.includes(
        "LEIDER HABEN WIR DERZEIT KEINE VERFÜGBAREN WOHNUNGSANGEBOTE"
      )
    ) {
      console.log(`[${currentTime}] No new apartments found.`);
    } else {
      const offers = await page.evaluate(() => {
        const offerElements = Array.from(
          document.querySelectorAll(".row.openimmo-search-list-item")
        );
        return offerElements.map((element) => {
          const title = element.querySelector(".imageTitle").textContent.trim();
          const address = element.querySelector(".address").textContent.trim();
          const sizeText = element
            .querySelector(".main-property-value.main-property-size")
            .textContent.trim();
          const size = parseFloat(
            sizeText.replace(",", ".").replace(" m²", "")
          );
          const link = element
            .querySelector('a[title="Details"]')
            .getAttribute("href");
          return { title, address, size, link };
        });
      });

      for (const offer of offers) {
        if (offer.size >= 70 && !previousOfferLinks.has(offer.link)) {
          const message = `${offer.title}\nSize: ${offer.size} m²\n${offer.address}\nLink: https://www.wbm.de${offer.link}`;
          console.log(`[${currentTime}] New apartment found: ${message}`);
          sendNotification(message, currentTime);
          previousOfferLinks.add(offer.link);
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.error(`[${currentTime}] Error: ${error.message}`);
  }

  // Wait for 7 minutes (or any desired interval) before checking again
  setTimeout(main, 7 * 60 * 1000); // 7 minutes
};

const sendNotification = (message, currentTime) => {
  try {
    const push = new Pushover({
      user: process.env.PUSHOVER_USER,
      token: process.env.PUSHOVER_TOKEN,
    });

    const notification = {
      message,
      title: "New Apartment Offer Available",
    };

    push.send(notification, (err, result) => {
      if (err) {
        console.error(
          `[${currentTime}] Error sending notification: ${err.message}`
        );
      } else {
        console.log(`[${currentTime}] Push notification sent successfully!`);
      }
    });
  } catch (error) {
    console.error(
      `[${currentTime}] Error sending notification: ${error.message}`
    );
  }
};

main(); // Start the script

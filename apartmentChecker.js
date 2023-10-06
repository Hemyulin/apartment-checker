const puppeteer = require("puppeteer");
const Pushover = require("pushover-notifications");

// Declare the currentTime variable outside of the callback function
let currentTime;

// Maintain a set to store the previously found offer links
const previousOfferLinks = new Set();

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");
  await new Promise((r) => setTimeout(r, 5000));

  // Get the current date and time
  currentTime = new Date().toLocaleString();

  const currentContent = await page.content();

  // Check if the specific message is present
  if (
    currentContent.includes(
      "LEIDER HABEN WIR DERZEIT KEINE VERFÜGBAREN WOHNUNGSANGEBOTE"
    )
  ) {
    console.log(`[${currentTime}] No new apartments found.`);
  } else {
    // Extract apartment offers
    const offers = await page.evaluate(() => {
      const offerElements = Array.from(
        document.querySelectorAll(".row.openimmo-search-list-item")
      );
      return offerElements.map((element) => {
        const title = element.querySelector(".imageTitle").textContent.trim();
        const address = element.querySelector(".address").textContent.trim();
        const link = element
          .querySelector('a[title="Details"]')
          .getAttribute("href");
        return { title, address, link };
      });
    });

    // Send notifications for each new offer
    for (const offer of offers) {
      if (!previousOfferLinks.has(offer.link)) {
        // Offer is not in the set of previously found offers
        const message = `${offer.title}\n${offer.address}\nLink: https://www.wbm.de${offer.link}`;
        console.log(`[${currentTime}] New apartment found: ${message}`);
        sendNotification(message, currentTime);
        previousOfferLinks.add(offer.link); // Add the offer link to the set
      }
    }
  }

  await browser.close();

  // Wait for 7 minutes (or any desired interval) before checking again
  await new Promise((r) => setTimeout(r, 7 * 60 * 1000)); // 7 minutes

  // Restart the script to clear the set of previously found offers
  process.exit();
})();

function sendNotification(message, currentTime) {
  const push = new Pushover({
    user: "u5kxerjg7kb362z3prsw758jzsedx2",
    token: "akup91m9ztbe4aku4wxt44ummcwejw",
  });

  const notification = {
    message,
    title: "New Apartment Offer Available",
  };

  push.send(notification, (err, result) => {
    if (err) throw err;
    console.log(`[${currentTime}] Push notification sent successfully!`);
  });
}

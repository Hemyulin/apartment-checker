const puppeteer = require("puppeteer");
const Pushover = require("pushover-notifications");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");
  await new Promise((r) => setTimeout(r, 5000));

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

    // Send notifications for each offer
    for (const offer of offers) {
      const message = `${offer.title}\n${offer.address}\nLink: https://www.wbm.de${offer.link}`;
      console.log(`[${currentTime}] New apartment found: ${message}`);
      sendNotification(message);
    }
  }

  await browser.close();
})();

function sendNotification(message) {
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
    console.log(`[${currentTime}]Push notification sent successfully!`);
  });
}

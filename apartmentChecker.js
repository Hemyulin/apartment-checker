const puppeteer = require("puppeteer");
const Pushover = require("pushover-notifications");

(async () => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");

  // Wait for a moment to ensure page content is loaded (you can adjust the delay as needed)
  await new Promise((r) => setTimeout(r, 420000));

  // Take a screenshot of the initial page
  await page.screenshot({ path: "apartment-listing.png" });

  // Store the initial page content
  let initialContent = await page.content();

  // Close the browser
  await browser.close();

  // Function to send Pushover notification
  function sendNotification(message) {
    const push = new Pushover({
      user: "u5kxerjg7kb362z3prsw758jzsedx2",
      token: "akup91m9ztbe4aku4wxt44ummcwejw",
    });

    const notification = {
      message,
      title: "New Apartments Available",
    };

    push.send(notification, (err, result) => {
      if (err) throw err;
      console.log("Push notification sent successfully!");
    });
  }

  // Function to check for new content
  async function checkForNewContent() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://www.wbm.de/wohnungen-berlin/angebote/");

    // Wait for a moment to ensure page content is loaded (you can adjust the delay as needed)
    await new Promise((r) => setTimeout(r, 5000));

    // Get the current page content
    let currentContent = await page.content();

    // Check if the content has the specific message
    if (
      currentContent.includes(
        "LEIDER HABEN WIR DERZEIT KEINE VERFÜGBAREN WOHNUNGSANGEBOTE"
      )
    ) {
      console.log("No new apartments found.");
    } else {
      console.log("New apartments found!");
      sendNotification("New apartments are available on the website.");
    }

    // Close the browser
    await browser.close();
  }

  // Schedule the content check to run at intervals (e.g., every 5 minutes)
  setInterval(checkForNewContent, 300000); // 300,000 milliseconds = 5 minutes
})();

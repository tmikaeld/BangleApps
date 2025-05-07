// Get app rectangle, which is the usable screen space minus widget areas
const appRect = Bangle.appRect;

// Clear the app area specifically
// g.clear() would clear the whole screen, including where widgets might be redrawn.
// g.clearRect is better here to avoid flicker if widgets are transparent.
g.setClipRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
g.clearRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
g.resetClipRect();

// Fill app area with a test color (e.g., blue) to ensure this part runs
g.setColor(0,0,1); // Blue
g.fillRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
g.setColor(1,1,1); // Reset to white for text

let image;
try {
  console.log("Attempting to load stumpe.img...");
  image = require("Storage").read("stumpe.img");
  console.log("Image loaded:", image ? JSON.stringify(image).substr(0,200)+"..." : "null or undefined");

  if (!image) throw new Error("Image is null/undefined after load"); // Explicitly throw if read returns nothing useful

} catch (e) {
  console.log("Error loading image:", e.toString());
  g.setFontAlign(0,0); // Center text
  g.setFont("6x8", 1);
  const midX = appRect.x + appRect.w/2;
  const midY = appRect.y + appRect.h/2;
  g.clearRect(appRect.x, midY - 20, appRect.x2, midY + 20); // Clear area for error
  g.drawString("Error loading stumpe.img:", midX, midY - 10);
  g.drawString(e.toString().substr(0,30), midX, midY + 10); // Show part of the error
  // No point loading widgets if the main content failed
  return; // Exit early
}

// If image is loaded, attempt to draw it
if (image) {
  console.log("Drawing image...");
  // Draw the image at the top-left of the app rectangle
  g.drawImage(image, appRect.x, appRect.y);
  
  // Draw a red border around where the image should be
  g.setColor(1,0,0); // Red
  g.drawRect(appRect.x, appRect.y, appRect.x + image.width -1 , appRect.y + image.height -1);
  // If image is 176x176, this border might be clipped if appRect is smaller
  // Let's also draw a border around the actual appRect itself
  g.setColor(0,1,0); // Green
  g.drawRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
  
} else {
  // This case should be caught by the error handling above, but as a fallback:
  console.log("Image variable is not set, even after try-catch.");
  g.setFontAlign(0,0);
  g.setFont("6x8", 2);
  g.clearRect(appRect.x, appRect.y + appRect.h/2 - 10, appRect.x2, appRect.y + appRect.h/2 + 10);
  g.drawString("Image load logic error", appRect.x + appRect.w/2, appRect.y + appRect.h/2);
}

// Load and draw widgets (like clock, battery status, etc.)
console.log("Loading widgets...");
Bangle.loadWidgets();
Bangle.drawWidgets();
console.log("App script finished.");

// This app is view-only, so no specific button/touch handlers are set here.
// Pressing the hardware button will exit the app by default. 
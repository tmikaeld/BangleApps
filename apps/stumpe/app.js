// Get app rectangle, which is the usable screen space minus widget areas
const appRect = Bangle.appRect;

// Clear the app area specifically
// g.clear() would clear the whole screen, including where widgets might be redrawn.
// g.clearRect is better here to avoid flicker if widgets are transparent.
g.setClipRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
g.clearRect(appRect.x, appRect.y, appRect.x2, appRect.y2);
g.resetClipRect();

let image;
try {
  // The App Loader converts 'stumpe-image.png' (from metadata.json)
  // into a loadable StorageFile named 'stumpe.img'
  image = require("Storage").read("stumpe.img");
} catch (e) {
  // Error message if image loading fails
  g.setFontAlign(0,0); // Center text
  g.setFont("6x8", 2); // Slightly larger font for readability
  const midX = appRect.x + appRect.w/2;
  const midY = appRect.y + appRect.h/2;
  g.drawString("Error:", midX, midY - 30);
  g.drawString("stumpe.img not found!", midX, midY - 10);
  g.setFont("6x8", 1);
  g.drawString("Please add stumpe-image.png", midX, midY + 10);
  g.drawString("to the apps/stumpe/ directory", midX, midY + 25);
  g.drawString("and reinstall the app.", midX, midY + 40);
  // No point loading widgets if the main content failed
  return;
}

if (image) {
  // Draw the image.
  // This draws the image at the top-left of the app rectangle (appRect.x, appRect.y).
  // If the image is smaller than the appRect, it will be at the top-left.
  // If larger, it will be clipped to the appRect.
  // For centering or scaling, you'd need image dimensions and more logic.
  g.drawImage(image, appRect.x, appRect.y);
} else {
  // This case should ideally be caught by the try-catch block above
  g.setFontAlign(0,0);
  g.setFont("6x8", 2);
  g.drawString("Image load error", appRect.x + appRect.w/2, appRect.y + appRect.h/2);
}

// Load and draw widgets (like clock, battery status, etc.)
Bangle.loadWidgets();
Bangle.drawWidgets();

// This app is view-only, so no specific button/touch handlers are set here.
// Pressing the hardware button will exit the app by default. 
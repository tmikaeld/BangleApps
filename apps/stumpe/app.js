// Simplest image display attempt

g.clear(); // Clear the entire screen to the background color (usually white or black based on theme)

let image;
try {
  console.log("[StumpeApp] Attempting to load stumpe.img...");
  image = require("Storage").read("stumpe.img");
  console.log("[StumpeApp] Image loaded object:", image);

  if (!image) {
    throw new Error("Image is null/undefined after load attempt.");
  }

  // Check if image has width and height, which real images should
  if (typeof image.width === 'undefined' || typeof image.height === 'undefined') {
      // If it's just a string, it's likely the raw PNG data that wasn't converted
      // or an Espruino Graphics object that wasn't created correctly.
      console.log("[StumpeApp] Image does not have width/height properties. It might be raw data or malformed.");
      throw new Error("Loaded image data is not in expected format.");
  }

} catch (e) {
  console.log("[StumpeApp] Error loading image:", e.toString());
  // Display error on screen
  g.setColor(g.theme.fg); // Set text color based on theme
  g.setFontAlign(0,0); // Center text
  g.setFont("6x8", 2); 
  const W = g.getWidth();
  const H = g.getHeight();
  g.drawString("ERROR:", W/2, H/2 - 20);
  g.setFont("6x8", 1);
  g.drawString(e.toString().substr(0,40), W/2, H/2);
  g.drawString("Check stumpe-image.js", W/2, H/2 + 20);
  g.drawString("and app logs.", W/2, H/2 + 35);
  // Set a watch to exit on button press if error occurs
  setWatch(() => load(), BTN1, {edge:"falling"});
  return; // Stop further execution
}

// If image is loaded successfully, attempt to draw it
if (image) {
  console.log("[StumpeApp] Drawing image at (0,0). Image dimensions: " + image.width + "x" + image.height);
  g.drawImage(image, 0, 0);
  
  // Optional: Draw a small green dot at the bottom right to confirm script completion
  g.setColor(0,1,0); // Green
  g.fillRect(g.getWidth()-5, g.getHeight()-5, g.getWidth()-1, g.getHeight()-1);
} else {
  // This case should ideally be caught by the try-catch block above if !image is true.
  console.log("[StumpeApp] Image variable is unexpectedly not set after try-catch (should have been caught).");
  g.setColor(g.theme.fg);
  g.setFontAlign(0,0);
  g.setFont("6x8", 2);
  g.drawString("Internal Load Fail", g.getWidth()/2, g.getHeight()/2);
}

// Allow exiting by pressing the button
setWatch(() => load(), BTN1, {edge:"falling"});

// Note: No Bangle.loadWidgets() / Bangle.drawWidgets() in this super simple version
// to minimize potential interference if the image itself is causing a full screen white-out.

console.log("[StumpeApp] Script finished."); 
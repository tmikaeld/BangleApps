// Simplest image display attempt

g.clear(); // Clear the entire screen

let image; // Declared outside
try {
  console.log("[StumpeApp] Attempting to load stumpe.mainimg.img...");
  image = require("Storage").read("stumpe.mainimg.img");
  
  let imageType = typeof image;
  let imagePreview = "(not logged)";
  if (imageType === "string") {
    imagePreview = image.substring(0,100) + (image.length > 100 ? "..." : "");
  } else if (image && imageType === "object" && typeof image.buffer !== "undefined") {
    imagePreview = "Object with buffer, w:" + image.width + " h:" + image.height;
  } else if (image) {
    imagePreview = JSON.stringify(image);
  }
  console.log("[StumpeApp] Image loaded. Type: " + imageType + ", Preview: " + imagePreview);

  if (!image) {
    throw new Error("Image data is null/undefined.");
  }

  // If it's an object, it must have width and height.
  // If it's a string, g.drawImage will handle it.
  if (imageType === "object" && (typeof image.width === 'undefined' || typeof image.height === 'undefined')) {
      console.log("[StumpeApp] Image is an object but lacks width/height properties.");
      throw new Error("Malformed image object.");
  }
  // No error thrown if it's a string or a valid image object.

} catch (e) {
  console.log("[StumpeApp] Error during image load/check:", e.toString());
  g.setColor(g.theme.fg);
  g.setFontAlign(0,0);
  g.setFont("6x8", 2);
  const W = g.getWidth();
  const H = g.getHeight();
  g.drawString("ERROR:", W/2, H/2 - 20);
  g.setFont("6x8", 1);
  g.drawString(e.toString().substr(0,40), W/2, H/2);
  g.drawString("Check stumpe-image.js", W/2, H/2 + 20);
  g.drawString("and Web IDE logs.", W/2, H/2 + 35);
  setWatch(() => load(), BTN1, {edge:"falling"});
  image = undefined; // Crucial: prevent drawing if a real error occurred
}

// This 'if (image)' will now only be true if the try block succeeded AND image is truthy.
if (image) {
  console.log("[StumpeApp] Drawing image at (0,0).");
  g.drawImage(image, 0, 0);
  
  g.setColor(0,1,0); // Green
  g.fillRect(g.getWidth()-5, g.getHeight()-5, g.getWidth()-1, g.getHeight()-1);
} else {
  // This block will execute if image is undefined (e.g. due to catch block)
  // The error message itself is already drawn by the catch block if an error occurred.
  console.log("[StumpeApp] Image not drawn, either due to load error or it was null/undefined.");
}

setWatch(() => load(), BTN1, {edge:"falling"});
console.log("[StumpeApp] Script finished.");

// Note: No Bangle.loadWidgets() / Bangle.drawWidgets() in this super simple version
// to minimize potential interference if the image itself is causing a full screen white-out. 
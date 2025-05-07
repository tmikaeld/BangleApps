g.clear(); // Clear the screen

// Function to draw the UI
function draw() {
  g.reset();
  g.setFont("Vector", 30);
  g.setFontAlign(0,0); // center X, center Y
  g.drawString("Play/Pause", g.getWidth()/2, g.getHeight()/2 - 15); // Adjusted Y for text below and widgets
  g.setFont("6x8", 2);
  g.drawString("Tap Screen", g.getWidth()/2, g.getHeight()/2 + 15);
}

// Define the touch handler function
const onTouch = function(button, xy) {
  if (typeof Bangle.musicControl === "function") {
    try {
      Bangle.buzz(40); // Short buzz for feedback
      Bangle.musicControl("playpause"); // Correct command for toggle Play/Pause

      // Visual feedback for "Sent!"
      g.setColor(g.theme.fg);
      g.setFont("6x8", 2);
      g.setFontAlign(0,0);
      // Position "Sent!" near the bottom of the app's drawing area
      const msgY = Bangle.appRect.y2 - 10; // 10px from the bottom of appRect
      // Clear a small area for the message before drawing
      g.clearRect(Bangle.appRect.x, msgY - 8, Bangle.appRect.x2, msgY + 8);
      g.drawString("Sent!", g.getWidth()/2, msgY); // Centered horizontally

      setTimeout(() => {
          // Clear the "Sent!" message by redrawing main UI
          draw();
      }, 1000);
    } catch (e) {
      // Show an error if Bangle.musicControl fails
      E.showAlert("Music cmd fail:\n" + e.toString().substr(0,100), "Error"); // Show first 100 chars of error
    }
  } else {
    E.showAlert("iOS music ctrl\nnot available.", "Error");
  }
};

// Set up touch handler for the whole screen
Bangle.on('touch', onTouch);

// Initial draw of the UI
draw();

// Load and draw widgets (like clock, battery)
Bangle.loadWidgets();
Bangle.drawWidgets();

// When the app is exited (e.g. by pressing the button),
// clear the touch listener to prevent it from firing in other apps.
E.on('kill', () => {
  Bangle.removeListener('touch', onTouch);
}); 

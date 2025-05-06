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

// Set up touch handler for the whole screen
Bangle.on('touch', function(button, xy) {
  if (typeof Bangle.musicControl === "function") {
    Bangle.buzz(40); // Short buzz for feedback
    Bangle.musicControl(2); // Command ID 2 is for Toggle Play/Pause for AMS

    // Visual feedback
    g.setColor(g.theme.fg);
    g.setFont("6x8", 2);
    g.setFontAlign(0,0);
    // Clear previous message area if any (though not strictly needed here)
    g.clearRect(0, g.getHeight() - 22, g.getWidth()-1, g.getHeight()-1 - widget_utils.getWidgetsHeight());

    g.drawString("Sent!", g.getWidth()/2, g.getHeight() - (widget_utils.getWidgetsHeight() ? widget_utils.getWidgetsHeight() : 10) - 10); // Position above widgets or bottom
    setTimeout(() => {
        // Clear the "Sent!" message after a bit by redrawing main UI
        // This also handles clearing the specific area correctly.
        draw();
    }, 1000);
  } else {
    E.showAlert("iOS music control\nnot available.", "Error");
  }
});

// Initial draw of the UI
draw();

// Load and draw widgets (like clock, battery)
Bangle.loadWidgets();
Bangle.drawWidgets();

// When the app is exited (e.g. by pressing the button),
// clear the touch listener to prevent it from firing in other apps.
E.on('kill', () => {
  Bangle.removeListener('touch', arguments.callee);
}); 

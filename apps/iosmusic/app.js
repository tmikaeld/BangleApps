g.clear(); // Clear the screen

const SETTINGS_FILE = "setting.json";
let controlMode = "none"; // "hid", "ams", or "none"

// Determine control mode
try {
  const settings = require("Storage").readJSON(SETTINGS_FILE, true) || {};
  if (settings.HID === "kbmedia") {
    controlMode = "hid";
  }
} catch (e) {
  console.log("Error reading settings:", e);
}

if (controlMode !== "hid" && typeof Bangle.musicControl === "function") {
  // HID not set for media, but AMS (Bangle.musicControl) is available
  controlMode = "ams";
}

let isPlaying = false; // Assume initially paused
let feedbackTimeout = null; // To manage clearing textual feedback

// Function to draw the UI
function draw() {
  g.reset();
  g.clearRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2); // Clear app area

  if (controlMode === "none") {
    g.setFont("6x8", 1); // Smaller font for more text
    g.setFontAlign(0,0);
    g.drawString(
      "Enable HID (kbmedia) in\\nBangle settings for PC/Mac,\\nOR ensure iOS connected\\nfor iPhone control.\\nThen reload app.",
      g.getWidth()/2, g.getHeight()/2
    );
    return;
  }

  const cx = g.getWidth()/2;
  const cy = g.getHeight()/2 - 15; // Vertical center for the icon
  const iconSize = 15; // Adjust size as needed

  if (isPlaying) {
    // Draw Pause icon (two vertical bars)
    const barWidth = iconSize * 0.6;
    const barGap = iconSize * 0.3;
    g.fillRect(cx - barGap/2 - barWidth, cy - iconSize, cx - barGap/2, cy + iconSize); // Left bar
    g.fillRect(cx + barGap/2, cy - iconSize, cx + barGap/2 + barWidth, cy + iconSize); // Right bar
  } else {
    // Draw Play icon (triangle)
    g.fillPoly([
      cx - iconSize * 0.7, cy - iconSize, 
      cx - iconSize * 0.7, cy + iconSize, 
      cx + iconSize * 0.9, cy
    ]);
  }

  g.setFont("6x8", 2);
  g.setFontAlign(0,0); // center X, center Y
  g.drawString("Tap or Swipe", g.getWidth()/2, g.getHeight()/2 + 15);
}

let dragStart = null; // To store drag start coordinates {x, y}

// Unified function to send media commands
function sendMediaCommand(commandStr) {
  if (controlMode === "none") return;

  try {
    if (controlMode === "hid") {
      let hidCode = 0;
      if (commandStr === "next") hidCode = 0x01;
      else if (commandStr === "prev") hidCode = 0x02;
      else if (commandStr === "playpause") hidCode = 0x10;
      else if (commandStr === "volup") hidCode = 0x40;
      else if (commandStr === "voldown") hidCode = 0x80;
      else return; // Unknown command for HID

      NRF.sendHIDReport([1, hidCode], () => {
        NRF.sendHIDReport([1, 0]); // Release key
      });
      console.log("Sent HID:", commandStr, "->", hidCode);
    } else if (controlMode === "ams") {
      // AMS commands are the same as our string commands
      Bangle.musicControl(commandStr);
      console.log("Sent AMS:", commandStr);
    }
  } catch (e) {
    console.log("Error sending " + controlMode.toUpperCase() + " cmd:", e);
    E.showAlert(controlMode.toUpperCase() + " Send Fail:\\n" + e.toString().substr(0,100), "Error");
  }
}

// Define the drag handler function
const onDrag = function(e) {
  if (controlMode === "none") return;

  if (e.b && !dragStart) { // Button pressed and no drag started yet (drag starts)
    dragStart = { x: e.x, y: e.y };
    return; // Don't do anything until drag ends
  }

  if (!e.b && dragStart) { // Button released and a drag was in progress (drag ends)
    const dx = e.x - dragStart.x;
    const dy = e.y - dragStart.y;

    const DRAG_THRESHOLD = 40; // Minimum pixel movement for a swipe
    const TAP_THRESHOLD = 20;  // Maximum pixel movement for a tap

    let command = null;
    let feedbackMsg = "";

    // Determine if it's a swipe or a tap
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) { // Potential swipe
      if (Math.abs(dx) > Math.abs(dy)) { // More horizontal than vertical
        if (dx > 0) {
          command = "next";
          feedbackMsg = "Next";
        } else {
          command = "prev";
          feedbackMsg = "Previous";
        }
      } else { // More vertical than horizontal
        if (dy < 0) { // Negative dy is swipe up
          command = "volup";
          feedbackMsg = "Vol Up";
        } else {
          command = "voldown";
          feedbackMsg = "Vol Down";
        }
      }
    } else if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) { // Tap
      command = "playpause";
      // feedbackMsg will be set to "Playing"/"Paused" below
    }

    if (command) {
      Bangle.buzz(40); // Haptic feedback
      sendMediaCommand(command); // Use the unified sender function

      if (command === "playpause") {
        isPlaying = !isPlaying;
        feedbackMsg = isPlaying ? "Playing" : "Paused";
      }
      // For swipes, feedbackMsg is already set (e.g., "Next", "Vol Up")

      draw(); // Immediately redraw to update icon or reflect current state

      // Visual feedback for the action (text message at bottom)
      g.setColor(g.theme.fg);
      g.setFont("6x8", 2);
      g.setFontAlign(0,0);
      const msgY = Bangle.appRect.y2 - 10; // 10px from the bottom of appRect
      // Clear only the area for the text message to avoid flickering the whole screen again
      g.clearRect(Bangle.appRect.x, msgY - 8, Bangle.appRect.x2, msgY + 8);
      g.drawString(feedbackMsg, g.getWidth()/2, msgY); // Centered horizontally

      if (feedbackTimeout) clearTimeout(feedbackTimeout); // Clear existing timeout
      feedbackTimeout = setTimeout(() => {
          draw(); // Redraw main UI to clear feedback message and ensure icon is correct
          feedbackTimeout = null;
      }, 1000);

    }
    dragStart = null; // Reset drag state
  }
};

// Set up drag handler - only if a control mode is active
if (controlMode !== "none") {
  Bangle.on('drag', onDrag);
}

// Initial draw of the UI
draw();

// Load and draw widgets (like clock, battery)
if (controlMode !== "none") {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

// When the app is exited (e.g. by pressing the button),
// clear the touch listener to prevent it from firing in other apps.
E.on('kill', () => {
  if (controlMode !== "none") {
    Bangle.removeListener('drag', onDrag);
  }
}); 

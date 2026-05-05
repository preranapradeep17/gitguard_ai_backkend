const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const webhookRoute = require("./routes/webhook");
const analyzeRoute = require("./routes/analyze");
const settingsRoute = require("./routes/settings");
const historyRoute = require("./routes/history");

const app = express();

app.use(express.json({
  limit: "2mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Bypass localtunnel password page
app.use((req, res, next) => {
  res.setHeader("bypass-tunnel-reminder", "true");
  next();
});

app.use("/webhook", webhookRoute);
app.use("/analyze", analyzeRoute);
app.use("/settings", settingsRoute);
app.use("/history", historyRoute);

app.get("/", (req, res) => {
  res.send("GitGuard AI running 🚀");
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

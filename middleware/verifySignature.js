// middleware/verifySignature.js

const crypto = require("crypto");

// ============================================================
// 🚨 TEMPORARY BYPASS MODE (for debugging only)
// Uncomment the block below and comment out the main logic
// to bypass signature verification while testing.
// ============================================================
module.exports = function verifySignature(req, res, next) {
  console.log("⚠️ Signature check bypassed (debug)");
  next();
};

// ============================================================
// ✅ SECURE SIGNATURE VERIFICATION
// ============================================================
// module.exports = function verifySignature(req, res, next) {
//   try {
//     const signature = req.headers["x-hub-signature-256"];
//     const secret = process.env.WEBHOOK_SECRET;
//
//     console.log("🔍 [verifySignature] Received header:", signature);
//     console.log("🔍 [verifySignature] Secret loaded?:", secret ? "YES" : "NO");
//
//     if (!signature) {
//       console.error("❌ [verifySignature] No x-hub-signature-256 header");
//       return res.status(401).send("❌ No signature provided");
//     }
//
//     if (!secret) {
//       console.error("❌ [verifySignature] WEBHOOK_SECRET not configured");
//       return res.status(500).send("❌ Webhook secret not configured");
//     }
//
//     const hmac = crypto.createHmac("sha256", secret);
//     const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");
//
//     console.log("🔍 [verifySignature] Computed digest:", digest);
//
//     // ✅ Defensive: timingSafeEqual throws if Buffer lengths differ
//     const sigBuf = Buffer.from(signature);
//     const digBuf = Buffer.from(digest);
//
//     if (sigBuf.length !== digBuf.length) {
//       console.error("❌ [verifySignature] Signature length mismatch. Possible secret mismatch.");
//       return res.status(401).send("❌ Invalid signature");
//     }
//
//     const isValid = crypto.timingSafeEqual(sigBuf, digBuf);
//
//     if (!isValid) {
//       console.error("❌ [verifySignature] Signature does not match digest");
//       return res.status(401).send("❌ Invalid signature");
//     }
//
//     console.log("✅ [verifySignature] Signature verified successfully");
//     next();
//   } catch (err) {
//     console.error("🔥 [verifySignature] Error:", err.message);
//     return res.status(500).send("❌ Signature verification error");
//   }
// };

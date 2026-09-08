import http from "http";
import https from "https";

/**
 * Keep-Alive Cron Job for Render Web Services
 *
 * Render's free tier spins down web services after 15 minutes of inactivity.
 * This cron job periodically sends an HTTP GET ping to the server's public /api/health
 * endpoint every 12 minutes (configurable) to keep the instance active and prevent cold starts.
 *
 * Supported Environment Variables:
 * - RENDER_EXTERNAL_URL: Automatically provided by Render (e.g. https://quizzy-api.onrender.com)
 * - SERVER_URL: Explicit backend URL override (e.g. https://quizzy-api.onrender.com)
 * - KEEP_ALIVE_URL: Custom health check URL
 * - ENABLE_KEEP_ALIVE: Set to 'false' to disable (defaults to true in production/Render)
 * - KEEP_ALIVE_INTERVAL_MINUTES: Ping frequency in minutes (default: 12)
 */

export function startKeepAliveJob(): NodeJS.Timeout | null {
  const isExplicitlyDisabled = process.env.ENABLE_KEEP_ALIVE === "false";
  if (isExplicitlyDisabled) {
    console.log("⏱️ [Keep-Alive Cron] Disabled via ENABLE_KEEP_ALIVE=false");
    return null;
  }

  const rawUrl =
    process.env.SERVER_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.KEEP_ALIVE_URL;

  if (!rawUrl) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️ [Keep-Alive Cron] Production mode detected, but RENDER_EXTERNAL_URL or SERVER_URL is not set. Set SERVER_URL to enable self-ping keep-alive."
      );
    } else {
      console.log(
        "ℹ️ [Keep-Alive Cron] Inactive in local development (no RENDER_EXTERNAL_URL or SERVER_URL set)."
      );
    }
    return null;
  }

  const baseUrl = rawUrl.replace(/\/+$/, "");
  const pingUrl = baseUrl.endsWith("/api/health")
    ? baseUrl
    : `${baseUrl}/api/health`;

  const intervalMinutes = Math.max(
    1,
    Math.min(
      14,
      parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || "12", 10) || 12
    )
  );
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(
    `⏰ [Keep-Alive Cron] Active! Pinging ${pingUrl} every ${intervalMinutes} minutes to keep Render active.`
  );

  const pingServer = () => {
    try {
      const urlObj = new URL(pingUrl);
      const isHttps = urlObj.protocol === "https:";
      const client = isHttps ? https : http;

      const req = client.get(
        pingUrl,
        {
          timeout: 25000,
          headers: {
            "User-Agent": "Quizzy-Render-KeepAlive-Cron/1.0",
            Accept: "application/json, text/plain, */*",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(
              `⚡ [Keep-Alive Cron] [${timestamp}] Pinged ${pingUrl} -> Status ${res.statusCode}`
            );
          });
        }
      );

      req.on("error", (err) => {
        console.warn(
          `⚠️ [Keep-Alive Cron] Ping attempt encountered an error: ${err.message}`
        );
      });

      req.on("timeout", () => {
        req.destroy();
        console.warn("⚠️ [Keep-Alive Cron] Ping attempt timed out after 25s");
      });
    } catch (err: any) {
      console.warn(`⚠️ [Keep-Alive Cron] Invalid ping URL (${pingUrl}): ${err.message}`);
    }
  };

  // Perform initial ping after 45 seconds to let the server finish booting
  const initialTimeout = setTimeout(pingServer, 45 * 1000);
  initialTimeout.unref();

  // Set recurring cron interval
  const interval = setInterval(pingServer, intervalMs);
  interval.unref();

  return interval;
}

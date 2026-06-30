import { Hono } from "hono";
import QRCode from "qrcode";

/**
 * QR Code Generator Route
 *
 * GET /api/qr?url=<URL> — generates PNG QR code pointing to the given URL
 * Default: https://giulio-occhipinti.com
 *
 * Colors:
 *  - dark: #084945 (ottanio — brand primary)
 *  - light: #f5f0e6 (warm paper — brand secondary)
 */
export const qrRouter = new Hono();

qrRouter.get("/qr", async (c) => {
  try {
    const url =
      c.req.query("url") || "https://giulio-occhipinti.com";

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return c.json(
        { error: "InvalidURL", message: "Invalid URL format" },
        400,
      );
    }

    const png = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: "#084945", // ottanio
        light: "#f5f0e6", // warm paper
      },
    });

    // Return as base64 PNG data URL
    return c.json({ qr: png, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: "QRGenerationError", message }, 500);
  }
});

/**
 * Alternative: GET /api/qr/png?url=<URL> — returns raw PNG image
 * (downloads directly instead of returning JSON)
 */
qrRouter.get("/qr/png", async (c) => {
  try {
    const url =
      c.req.query("url") || "https://giulio-occhipinti.com";

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return c.text("Invalid URL format", 400);
    }

    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: "#084945",
        light: "#f5f0e6",
      },
    });

    return c.body(buffer, 200, { "Content-Type": "image/png" });
  } catch (error) {
    return c.text("QR generation failed", 500);
  }
});

/**
 * GET /api/qr/svg?url=<URL> — returns SVG (vector, scalable)
 */
qrRouter.get("/qr/svg", async (c) => {
  try {
    const url =
      c.req.query("url") || "https://giulio-occhipinti.com";

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return c.text("Invalid URL format", 400);
    }

    const svg = await QRCode.toString(url, {
      errorCorrectionLevel: "H",
      type: "image/svg+xml",
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: "#084945",
        light: "#f5f0e6",
      },
    });

    return c.text(svg, 200, { "Content-Type": "image/svg+xml" });
  } catch (error) {
    return c.text("QR generation failed", 500);
  }
});

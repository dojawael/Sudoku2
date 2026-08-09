import POWR from "@powr-games/sdk";

let cachedClient: any = null;

export async function initializePOWR() {
  if (typeof window === "undefined") {
    return null;
  }

  // If we already have a client with an active session, return it immediately.
  if (cachedClient && cachedClient.player) {
    console.log("Returning cached POWR client with active session.");
    return cachedClient;
  }

  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");

  // Fallback: Check hash params (some routers or platforms pass parameters in hash fragment)
  if (!token && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    token = hashParams.get("token");
  }

  // Persist / Retrieve token from sessionStorage so page reloads don't break the session
  if (token) {
    try {
      sessionStorage.setItem("powr_token", token);
    } catch (e) {
      console.warn("sessionStorage is not available:", e);
    }
  } else {
    try {
      token = sessionStorage.getItem("powr_token");
    } catch (e) {
      console.warn("sessionStorage is not available:", e);
    }
  }

  // Allow the game to run normally during local development.
  if (!token) {
    console.log("Running without a POWR session.");
    return null;
  }

  try {
    const isDebug = process.env.NODE_ENV !== "production";
    if (isDebug) {
      console.log("[POWR SDK] Initializing with token:", token.substring(0, 10) + "...");
    }

    // Dynamically determine platform origin and API URL based on iframe parent referrer if available
    let platformOrigin = "https://powr-games.vercel.app";
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        // Only trust localhost, powr.sa, or powr-games domains
        if (
          refUrl.hostname === "localhost" ||
          refUrl.hostname.endsWith("powr.sa") ||
          refUrl.hostname.endsWith("powr-games.vercel.app")
        ) {
          platformOrigin = refUrl.origin;
        }
      } catch (e) {
        // Ignore
      }
    }

    const powr = await POWR.init({
      apiKey: "pk_f35a860cd03bcc8a2a3f7931137b4d9e7c6c01b0a8de84ff",
      token: token,
      apiUrl: platformOrigin, // Direct API requests to the matching platform origin (e.g. preview branch or dev)
      platformOrigin: platformOrigin,
      debug: isDebug,
    });

    if (!powr.player) {
      console.warn("POWR player is not available.");
      return powr;
    }

    console.log("POWR Player:", powr.player.username);
    cachedClient = powr; // Cache the client for future imports/remounts
    return powr;
  } catch (error) {
    console.error("POWR initialization failed:", error);
    return null;
  }
}
import POWR from "@powr-games/sdk";

export async function initializePOWR() {
  if (typeof window === "undefined") {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get("token");

  // Fallback: Check hash params (some routers or platforms pass parameters in hash fragment)
  if (!token && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    token = hashParams.get("token");
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

    const powr = await POWR.init({
      apiKey: "pk_f35a860cd03bcc8a2a3f7931137b4d9e7c6c01b0a8de84ff",
      token: token,
      apiUrl: "https://powr-games.vercel.app",
      platformOrigin: "https://powr-games.vercel.app",
      debug: isDebug,
    });

    if (!powr.player) {
      console.warn(
        "POWR player is not available."
      );

      return powr;
    }

    console.log(
      "POWR Player:",
      powr.player.username
    );

    return powr;
  } catch (error) {
    console.error(
      "POWR initialization failed:",
      error
    );

    return null;
  }
}
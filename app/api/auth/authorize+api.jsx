import {
  BASE_URL,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  APP_SCHEME,
  GOOGLE_REDIRECT_URI,
} from "../../../constants";

export async function GET(request) {
  if (!GOOGLE_CLIENT_ID) {
    return Response.json(
      { message: "Missing GOOGLE_CLIENT_ID" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const originalRedirectUri = url.searchParams.get("redirect_uri");

  let idpClientId;

  const internalClient = url.searchParams.get("client_id");
  let redirectUri = url.searchParams.get("redirect_uri");

  let platform;
  console.log("redirectUri", redirectUri);
  console.log("app scheme", APP_SCHEME);
  console.log("BASE_URL", BASE_URL);

  if (redirectUri === APP_SCHEME) {
    platform = "mobile";
  } else if (redirectUri === BASE_URL) {
    platform = "web"; // Fixed: was using === instead of =
  } else if (redirectUri && redirectUri.startsWith("exp://")) {
    // Handle Expo development URLs
    platform = "mobile";
  } else {
    return Response.json({ message: "Invalid redirect URI" }, { status: 400 });
    // redirectUri = "exp://192.168.18.5:8081";
    // url.searchParams.set("redirectUri", redirectUri);
    // platform = "mobile";
  }

  // Use state to drive redirect back to platform
  // let state = platform + "|" + url.searchParams.get("state");
  let state =
    platform + "|" + originalRedirectUri + "|" + url.searchParams.get("state");

  // Fixed: This condition was inverted
  if (internalClient === "google") {
    idpClientId = GOOGLE_CLIENT_ID;
  } else {
    return Response.json({ message: "Invalid client" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: idpClientId,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: url.searchParams.get("scope") || "identity",
    state: state,
    prompt: "select_account",
  });

  return Response.redirect(GOOGLE_AUTH_URL + "?" + params.toString());
}

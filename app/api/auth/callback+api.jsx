export async function GET(request) {
  const incomingParams = new URLSearchParams(request.url.split("?")[1]);
  const combinedPlatformAndState = incomingParams.get("state");

  if (!combinedPlatformAndState) {
    return Response.json({ error: "Invalid State" }, { status: 400 });
  }

  const [platform, originalRedirectUri, state] =
    combinedPlatformAndState.split("|");
  console.log(
    "platform",
    platform,
    "originalRedirectUri",
    originalRedirectUri,
    "state",
    state
  );

  const code = incomingParams.get("code");
  if (!code) {
    return Response.json(
      { error: "No authorization code received" },
      { status: 400 }
    );
  }

  const outGoingParams = new URLSearchParams({
    code: code,
    state: state,
  });

  // Use the original redirect URI that came from the client
  const finalRedirectUrl =
    originalRedirectUri + "?" + outGoingParams.toString();
  console.log("Final redirect URL:", finalRedirectUrl);

  return Response.redirect(finalRedirectUrl);
}

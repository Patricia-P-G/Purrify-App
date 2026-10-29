# spotify-auth (Appwrite function)

Links a Spotify account to an Appwrite user, so Purrify can create an Appwrite session after the Spotify login.

## How it works

1. The frontend sends a `POST` request with `{ "accessToken": "<spotify access token>" }`.
2. The function calls `https://api.spotify.com/v1/me` to check that the token is real and find the Spotify user.
3. It creates a stable Appwrite user ID from a SHA-256 hash of the Spotify user ID: `spotify_<first 28 characters of the hash>`. The same Spotify account always gets the same Appwrite user, and the raw Spotify ID is never used as the Appwrite ID.
4. It gets that Appwrite user, or creates it if it doesn't exist yet. If two logins create the user at the same time, the `409` conflict is ignored.
5. It creates a login token that is valid for 15 minutes and returns `{ "userId": "...", "secret": "..." }`. The frontend passes these to `account.createSession()`.

No secrets are stored in this code. Appwrite gives the function a temporary API key on every execution (`x-appwrite-key` header).

## Settings in the Appwrite console

| Setting | Value |
|---|---|
| Function ID | `spotify-auth` |
| Runtime | Node.js 18 |
| Entrypoint | `src/main.js` |
| Build command | `npm install` |
| Execute access | `Any` (the user isn't logged in to Appwrite yet when this runs) |
| Timeout | 15 seconds |
| Scopes | `users.read`, `users.write` |

## Environment variables

None need to be set. The function only uses the variables Appwrite provides automatically (`APPWRITE_FUNCTION_API_ENDPOINT` and `APPWRITE_FUNCTION_PROJECT_ID`).

## Formatting

```bash
npm install
npm run format   # formats the code with Prettier
```

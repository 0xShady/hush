#!/bin/sh
# Uploads a package to the Chrome Web Store (API v2) and submits it for review.
# `--check` only prints the item's status, to test the credentials.
# Env: CWS_SERVICE_ACCOUNT_KEY (secret, the JSON key), CWS_PUBLISHER_ID, CWS_EXTENSION_ID.
set -eu

api="https://chromewebstore.googleapis.com"
item="publishers/$CWS_PUBLISHER_ID/items/$CWS_EXTENSION_ID"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

keyfile=$(mktemp)
trap 'rm -f "$keyfile"' EXIT
printf %s "$CWS_SERVICE_ACCOUNT_KEY" | jq -r .private_key >"$keyfile"

header=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
claims=$(printf %s "$CWS_SERVICE_ACCOUNT_KEY" | jq -c --argjson now "$(date +%s)" '{
	iss: .client_email,
	scope: "https://www.googleapis.com/auth/chromewebstore",
	aud: "https://oauth2.googleapis.com/token",
	iat: $now,
	exp: ($now + 3600)
}' | b64url)
signature=$(printf %s "$header.$claims" | openssl dgst -sha256 -sign "$keyfile" | b64url)

token=$(curl -sS --fail-with-body https://oauth2.googleapis.com/token \
	--data-urlencode grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer \
	--data-urlencode assertion="$header.$claims.$signature" | jq -r .access_token)
auth="Authorization: Bearer $token"

if [ "${1:-}" = --check ]; then
	curl -sS --fail-with-body -H "$auth" "$api/v2/$item:fetchStatus"
	exit
fi

zip="$1"

upload=$(curl -sS --fail-with-body -X POST -H "$auth" -H "Content-Type: application/zip" \
	--data-binary @"$zip" "$api/upload/v2/$item:upload")
echo "upload: $upload"
state=$(echo "$upload" | jq -r '.uploadState // empty')

tries=0
while [ "$state" = "UPLOAD_IN_PROGRESS" ] || [ "$state" = "IN_PROGRESS" ]; do
	tries=$((tries + 1))
	[ "$tries" -le 30 ] || { echo "Upload still in progress after 5 minutes."; exit 1; }
	sleep 10
	status=$(curl -sS --fail-with-body -H "$auth" "$api/v2/$item:fetchStatus")
	echo "status: $status"
	state=$(echo "$status" | jq -r '.lastAsyncUploadState // .uploadState // empty')
done

case "$state" in
	*FAIL*) echo "Upload failed."; exit 1 ;;
esac

publish=$(curl -sS --fail-with-body -X POST -H "$auth" -H "Content-Length: 0" "$api/v2/$item:publish")
echo "publish: $publish"

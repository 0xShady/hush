#!/bin/sh
# Uploads a package to the Chrome Web Store (API v2) and submits it for review.
# Env: CWS_CLIENT_ID, CWS_CLIENT_SECRET, CWS_REFRESH_TOKEN (secrets), CWS_PUBLISHER_ID, CWS_EXTENSION_ID.
set -eu

zip="$1"
api="https://chromewebstore.googleapis.com"
item="publishers/$CWS_PUBLISHER_ID/items/$CWS_EXTENSION_ID"

token=$(curl -sS --fail-with-body https://oauth2.googleapis.com/token \
	-d client_id="$CWS_CLIENT_ID" -d client_secret="$CWS_CLIENT_SECRET" \
	-d refresh_token="$CWS_REFRESH_TOKEN" -d grant_type=refresh_token | jq -r .access_token)
auth="Authorization: Bearer $token"

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

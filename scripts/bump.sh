#!/bin/sh
set -eu

version="${1:-}"
printf %s "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || { echo "Usage: npm run bump 1.2.3"; exit 1; }
if grep -q "^## $version " CHANGELOG.md; then
	echo "CHANGELOG.md already has $version."
	exit 1
fi

npm version "$version" --no-git-tag-version >/dev/null

for file in manifest.chrome.json manifest.firefox.json; do
	node -e '
		const fs = require("fs");
		const [file, version] = process.argv.slice(1);
		fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/"version": "[^"]+"/, `"version": "${version}"`));
	' "$file" "$version"
done

section="## $version ($(date +%F))"
updated=$(awk -v section="$section" '!done && /^## / { print section "\n\n-\n"; done = 1 } { print }' CHANGELOG.md)
printf '%s\n' "$updated" >CHANGELOG.md

echo "Version is now $version. Fill in its section in CHANGELOG.md."

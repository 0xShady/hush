#!/bin/sh
set -eu

version="v$(node -p "require('./package.json').version")"
[ "$(git branch --show-current)" = main ] || { echo "Releases come from main."; exit 1; }
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || { echo "main is not up to date with origin."; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Commit or stash your changes first."; exit 1; }

if [ $# -gt 0 ]; then
	gh release create "$version-$1" --target main --generate-notes --prerelease --title "$version-$1"
	exit
fi

notes=$(awk -v heading="## ${version#v} " '/^## / { if (found) exit; found = index($0, heading) == 1; next } found' CHANGELOG.md | sed '/^[[:space:]]*-*[[:space:]]*$/d')
[ -n "$notes" ] || { echo "CHANGELOG.md has no notes for ${version#v}."; exit 1; }

printf '%s\n' "$notes" | gh release create "$version" --target main --notes-file - --title "$version"

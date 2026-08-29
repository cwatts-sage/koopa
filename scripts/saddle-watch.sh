#!/bin/bash
# Saddle watch for Ryan (+19402849222) — R.E. Donahoe/Donaho + Bill Barton saddles
#
# WHY THIS EXISTS: web_search has no provider configured on this box, so the
# normal search path is dead. RanchWorldAds has NO keyword search either
# (its "listing" field is an ad-number lookup, not text search). So we crawl
# the Saddles category (cat_id=12) sorted newest-first and grep the titles.
#
# Usage: ./saddle-watch.sh [num_pages]   (default 15 pages ≈ 585 newest listings)

PAGES="${1:-15}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
BASE="https://www.ranchworldads.com"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PATTERN="donahoe|donaho|barton"

for pg in $(seq 1 "$PAGES"); do
  curl -s -m 25 -A "$UA" \
    "$BASE/index.php?cat_id=12&pg=$pg&sort=date&sort_dir=d&filter=&filterstate=" \
    -o "$TMP/p$pg.html"
  sleep 1.2   # be polite
done

# Pair each title with its listing URL
grep -ohE 'classified\.php\?listing=[0-9]+" class="ad_link">[^<]+' "$TMP"/p*.html \
  | sed -E 's|classified\.php\?listing=([0-9]+)" class="ad_link">|\1\t|' \
  > "$TMP/titles.tsv"

TOTAL=$(wc -l < "$TMP/titles.tsv" | tr -d ' ')
echo "Scanned $PAGES pages, $TOTAL listings."

MATCHES=$(grep -iE "$PATTERN" "$TMP/titles.tsv")
if [ -n "$MATCHES" ]; then
  echo "=== MATCHES FOUND — notify Ryan (+19402849222) ==="
  echo "$MATCHES" | while IFS=$'\t' read -r id title; do
    echo "  $title"
    echo "    $BASE/classified.php?listing=$id"
  done
  exit 10   # exit 10 = hits found
else
  echo "No Donahoe/Donaho/Barton saddles found."
  exit 0
fi

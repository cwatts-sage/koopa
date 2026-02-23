#!/bin/bash
# NFL Pick 'Em Pool Manager
# Usage: pool-manager.sh <command> [args]
#
# Commands:
#   new-week <week_number>          Create a new week file (matchups added manually or via populate)
#   add-matchup <week> <away> <home> [kickoff]   Add a matchup to a week
#   record-pick <week> <phone> <matchup_id> <team>   Record a member's pick
#   set-winner <week> <matchup_id> <team>   Set the winner of a matchup
#   score <week>                    Score all picks for a week and update standings
#   standings                       Show current standings
#   status <week>                   Show who has/hasn't submitted picks

POOL_DIR="$(cd "$(dirname "$0")" && pwd)"
STANDINGS_FILE="$POOL_DIR/standings.json"

case "$1" in
  new-week)
    WEEK=$2
    if [ -z "$WEEK" ]; then echo "Usage: pool-manager.sh new-week <week_number>"; exit 1; fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ -f "$WEEK_FILE" ]; then echo "Week $WEEK already exists: $WEEK_FILE"; exit 1; fi
    
    # Read member list from standings
    jq --arg week "$WEEK" '{
      week: ($week | tonumber),
      season: .season,
      deadline: null,
      matchups: [],
      picks: (.members | to_entries | map({
        key: .key,
        value: { name: .value.name, picks: {}, submitted_at: null }
      }) | from_entries),
      status: "open"
    }' "$STANDINGS_FILE" > "$WEEK_FILE"
    echo "Created $WEEK_FILE"
    ;;

  add-matchup)
    WEEK=$2; AWAY=$3; HOME=$4; KICKOFF=${5:-null}
    if [ -z "$WEEK" ] || [ -z "$AWAY" ] || [ -z "$HOME" ]; then
      echo "Usage: pool-manager.sh add-matchup <week> <away> <home> [kickoff]"; exit 1
    fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ ! -f "$WEEK_FILE" ]; then echo "Week $WEEK doesn't exist. Run new-week first."; exit 1; fi
    
    NEXT_ID=$(jq '.matchups | length + 1' "$WEEK_FILE")
    jq --arg away "$AWAY" --arg home "$HOME" --arg kickoff "$KICKOFF" --argjson id "$NEXT_ID" \
      '.matchups += [{ id: $id, away: $away, home: $home, kickoff: (if $kickoff == "null" then null else $kickoff end), winner: null }]' \
      "$WEEK_FILE" > "$WEEK_FILE.tmp" && mv "$WEEK_FILE.tmp" "$WEEK_FILE"
    echo "Added matchup $NEXT_ID: $AWAY @ $HOME"
    ;;

  record-pick)
    WEEK=$2; PHONE=$3; MATCHUP_ID=$4; TEAM=$5
    if [ -z "$WEEK" ] || [ -z "$PHONE" ] || [ -z "$MATCHUP_ID" ] || [ -z "$TEAM" ]; then
      echo "Usage: pool-manager.sh record-pick <week> <phone> <matchup_id> <team>"; exit 1
    fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ ! -f "$WEEK_FILE" ]; then echo "Week $WEEK doesn't exist."; exit 1; fi
    
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    jq --arg phone "$PHONE" --arg mid "$MATCHUP_ID" --arg team "$TEAM" --arg now "$NOW" \
      '.picks[$phone].picks[$mid] = $team | .picks[$phone].submitted_at = $now' \
      "$WEEK_FILE" > "$WEEK_FILE.tmp" && mv "$WEEK_FILE.tmp" "$WEEK_FILE"
    echo "Recorded: $PHONE picked $TEAM for matchup $MATCHUP_ID (week $WEEK)"
    ;;

  set-winner)
    WEEK=$2; MATCHUP_ID=$3; TEAM=$4
    if [ -z "$WEEK" ] || [ -z "$MATCHUP_ID" ] || [ -z "$TEAM" ]; then
      echo "Usage: pool-manager.sh set-winner <week> <matchup_id> <team>"; exit 1
    fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ ! -f "$WEEK_FILE" ]; then echo "Week $WEEK doesn't exist."; exit 1; fi
    
    jq --argjson mid "$MATCHUP_ID" --arg team "$TEAM" \
      '.matchups = [.matchups[] | if .id == $mid then .winner = $team else . end]' \
      "$WEEK_FILE" > "$WEEK_FILE.tmp" && mv "$WEEK_FILE.tmp" "$WEEK_FILE"
    echo "Set winner of matchup $MATCHUP_ID to $TEAM (week $WEEK)"
    ;;

  score)
    WEEK=$2
    if [ -z "$WEEK" ]; then echo "Usage: pool-manager.sh score <week>"; exit 1; fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ ! -f "$WEEK_FILE" ]; then echo "Week $WEEK doesn't exist."; exit 1; fi
    
    echo "=== Week $WEEK Results ==="
    echo ""
    
    # Build winner map and score each member
    jq -r '
      .matchups as $matchups |
      ($matchups | map(select(.winner != null)) | map({(.id | tostring): .winner}) | add // {}) as $winners |
      .picks | to_entries[] |
      .key as $phone | .value as $member |
      ($member.picks | to_entries | map(select($winners[.key] != null and .value == $winners[.key])) | length) as $correct |
      ($matchups | length) as $total |
      "\($member.name) (\($phone)): \($correct)/\($total) correct"
    ' "$WEEK_FILE"
    
    echo ""
    echo "Updating standings..."
    
    # Update standings.json with week scores
    WEEK_SCORES=$(jq -c '
      .matchups as $matchups |
      ($matchups | map(select(.winner != null)) | map({(.id | tostring): .winner}) | add // {}) as $winners |
      .picks | to_entries | map({
        key: .key,
        value: (.value.picks | to_entries | map(select($winners[.key] != null and .value == $winners[.key])) | length)
      }) | from_entries
    ' "$WEEK_FILE")
    
    jq --arg week "$WEEK" --argjson scores "$WEEK_SCORES" '
      .members = (.members | to_entries | map(
        .key as $phone |
        .value.weeklyScores[$week] = ($scores[$phone] // 0) |
        .value.totalPoints = ([.value.weeklyScores | to_entries[].value] | add // 0) |
        { key: $phone, value: .value }
      ) | from_entries) |
      .weeks[$week] = "scored"
    ' "$STANDINGS_FILE" > "$STANDINGS_FILE.tmp" && mv "$STANDINGS_FILE.tmp" "$STANDINGS_FILE"
    
    echo "Standings updated."
    ;;

  standings)
    echo "=== Watts Football Pool Standings ==="
    echo ""
    jq -r '
      .members | to_entries | sort_by(-.value.totalPoints) |
      to_entries[] |
      "\(.key + 1). \(.value.value.name): \(.value.value.totalPoints) pts"
    ' "$STANDINGS_FILE"
    ;;

  status)
    WEEK=$2
    if [ -z "$WEEK" ]; then echo "Usage: pool-manager.sh status <week>"; exit 1; fi
    WEEK_FILE="$POOL_DIR/picks-week-$(printf '%02d' $WEEK).json"
    if [ ! -f "$WEEK_FILE" ]; then echo "Week $WEEK doesn't exist."; exit 1; fi
    
    echo "=== Week $WEEK Pick Status ==="
    TOTAL_MATCHUPS=$(jq '.matchups | length' "$WEEK_FILE")
    echo "Matchups: $TOTAL_MATCHUPS"
    echo ""
    jq -r --argjson total "$TOTAL_MATCHUPS" '
      .picks | to_entries[] |
      "\(.value.name): \(.value.picks | length)/\($total) picks \(if .value.submitted_at then "✅" else "❌" end)"
    ' "$WEEK_FILE"
    ;;

  *)
    echo "NFL Pick 'Em Pool Manager"
    echo ""
    echo "Commands:"
    echo "  new-week <week>                           Create a new week"
    echo "  add-matchup <week> <away> <home> [kickoff] Add a game"
    echo "  record-pick <week> <phone> <mid> <team>   Record a pick"
    echo "  set-winner <week> <mid> <team>            Set game winner"
    echo "  score <week>                              Score and update standings"
    echo "  standings                                  Show standings"
    echo "  status <week>                             Who's picked?"
    ;;
esac

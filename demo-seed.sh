#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${BASE_URL:-http://localhost}"
BASE_URL="${BASE_URL%/}"
DEMO_PASSWORD="${DEMO_PASSWORD:-Jury1234!}"
EMAIL_DOMAIN="${EMAIL_DOMAIN:-breezy.fr}"
LEGACY_EMAIL_DOMAIN="${LEGACY_EMAIL_DOMAIN:-demo.breezy.local}"
SEED_INTERACTIONS="${SEED_INTERACTIONS:-0}"

COOKIE_DIR="$(mktemp -d)"
trap 'rm -rf "$COOKIE_DIR"' EXIT

HTTP_STATUS=""
HTTP_BODY=""

log() {
  echo "$@" >&2
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

request() {
  local method="$1"
  local jar="$2"
  local path="$3"
  local payload="${4:-}"
  local body_file
  body_file="$(mktemp)"

  local args=(-sS -o "$body_file" -w "%{http_code}" -X "$method" "$BASE_URL$path")
  if [[ -n "$jar" ]]; then
    args+=(-b "$jar" -c "$jar")
  fi
  if [[ -n "$payload" ]]; then
    args+=(-H "Content-Type: application/json" --data "$payload")
  fi

  HTTP_STATUS="$(curl "${args[@]}")"
  HTTP_BODY="$(cat "$body_file")"
  rm -f "$body_file"
}

json_account() {
  node -e 'const [username, displayName, email, password] = process.argv.slice(1); process.stdout.write(JSON.stringify({ username, displayName, email, password }));' "$@"
}

json_profile() {
  node -e '
const [displayName, bio, avatarUrl, bannerUrl, language] = process.argv.slice(1);
process.stdout.write(JSON.stringify({ displayName, bio, avatarUrl, bannerUrl, language }));
' "$@"
}

json_post() {
  node -e '
const [content, mediaUrl, parentId] = process.argv.slice(1);
const payload = { content };
if (mediaUrl) payload.media = [{ url: mediaUrl, type: mediaUrl.toLowerCase().includes(".gif") ? "gif" : "image" }];
if (parentId) payload.parentId = parentId;
process.stdout.write(JSON.stringify(payload));
' "$@"
}

extract_post_id() {
  node -e '
let data = "";
process.stdin.on("data", chunk => data += chunk);
process.stdin.on("end", () => {
  try {
    const json = JSON.parse(data);
    process.stdout.write(json.post?._id || json._id || "");
  } catch {}
});
'
}

find_post_id_by_content() {
  local content="$1"
  node -e '
const fs = require("fs");
const content = process.argv[1];
try {
  const posts = JSON.parse(fs.readFileSync(0, "utf8"));
  const match = Array.isArray(posts) ? posts.find(post => post.content === content && !post.deleted) : null;
  process.stdout.write(match?._id || "");
} catch {}
' "$content"
}

find_reply_id_by_content() {
  local content="$1"
  node -e '
const fs = require("fs");
const content = process.argv[1];
try {
  const posts = JSON.parse(fs.readFileSync(0, "utf8"));
  const match = Array.isArray(posts) ? posts.find(post => post.content === content && !post.deleted) : null;
  process.stdout.write(match?._id || "");
} catch {}
' "$content"
}

is_following_target() {
  local target="$1"
  node -e '
const fs = require("fs");
const target = process.argv[1];
try {
  const follows = JSON.parse(fs.readFileSync(0, "utf8"));
  const ok = Array.isArray(follows) && follows.some(row => row["followed.username"] === target);
  process.stdout.write(ok ? "1" : "0");
} catch {
  process.stdout.write("0");
}
' "$target"
}

is_liked() {
  node -e '
const fs = require("fs");
try {
  const json = JSON.parse(fs.readFileSync(0, "utf8"));
  process.stdout.write(json.liked ? "1" : "0");
} catch {
  process.stdout.write("0");
}
'
}

jar_for() {
  printf "%s/%s.cookies" "$COOKIE_DIR" "$1"
}

email_for() {
  printf "%s@%s" "$1" "$EMAIL_DOMAIN"
}

legacy_email_for() {
  printf "%s@%s" "$1" "$LEGACY_EMAIL_DOMAIN"
}

login_account() {
  local username="$1"
  local email="$2"
  local jar="$3"

  request "POST" "$jar" "/api/auth/login" "$(node -e 'const [email, password] = process.argv.slice(1); process.stdout.write(JSON.stringify({ email, password }));' "$email" "$DEMO_PASSWORD")"
  if [[ "$HTTP_STATUS" == "200" ]]; then
    log "logged in: $username ($email)"
    return 0
  fi

  return 1
}

update_account_email() {
  local username="$1"
  local email="$2"
  local jar="$3"

  request "PATCH" "$jar" "/api/auth/me" "$(node -e 'const [email, currentPassword] = process.argv.slice(1); process.stdout.write(JSON.stringify({ email, currentPassword }));' "$email" "$DEMO_PASSWORD")"
  if [[ "$HTTP_STATUS" == "200" ]]; then
    log "updated account email: $username -> $email"
    return 0
  fi

  echo "email update failed for $username ($HTTP_STATUS): $HTTP_BODY" >&2
  return 1
}

ensure_account() {
  local username="$1"
  local display_name="$2"
  local email
  local legacy_email
  local jar
  email="$(email_for "$username")"
  legacy_email="$(legacy_email_for "$username")"
  jar="$(jar_for "$username")"

  request "POST" "$jar" "/api/auth/register" "$(json_account "$username" "$display_name" "$email" "$DEMO_PASSWORD")"
  case "$HTTP_STATUS" in
  201)
    log "created account: $username"
    if ! login_account "$username" "$email" "$jar"; then
      echo "login failed for newly created account $username ($HTTP_STATUS): $HTTP_BODY" >&2
      exit 1
    fi
    return
    ;;
  400)
    log "account exists or cannot be registered, trying login: $username"
    ;;
  *)
    echo "register failed for $username ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
    ;;
  esac

  if login_account "$username" "$email" "$jar"; then
    return
  fi

  if [[ "$legacy_email" != "$email" ]] && login_account "$username" "$legacy_email" "$jar"; then
    update_account_email "$username" "$email" "$jar" || exit 1
    return
  fi

  echo "login failed for $username with $email or $legacy_email. Check the existing account password." >&2
  exit 1
}

update_profile() {
  local username="$1"
  local display_name="$2"
  local bio="$3"
  local avatar_url="$4"
  local banner_url="$5"
  local language="${6:-fr}"
  local jar
  jar="$(jar_for "$username")"

  request "PATCH" "$jar" "/api/users/me" "$(json_profile "$display_name" "$bio" "$avatar_url" "$banner_url" "$language")"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    echo "profile update failed for $username ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
  fi
  log "updated profile: $username"
}

ensure_post() {
  local username="$1"
  local content="$2"
  local media_url="${3:-}"
  local jar
  local existing_id
  local post_id
  jar="$(jar_for "$username")"

  request "GET" "$jar" "/api/posts/user/$username?type=posts&limit=100"
  if [[ "$HTTP_STATUS" == "200" ]]; then
    existing_id="$(printf "%s" "$HTTP_BODY" | find_post_id_by_content "$content")"
    if [[ -n "$existing_id" ]]; then
      log "post already exists for $username: $existing_id"
      printf "%s" "$existing_id"
      return
    fi
  fi

  request "POST" "$jar" "/api/posts" "$(json_post "$content" "$media_url" "")"
  if [[ "$HTTP_STATUS" != "201" ]]; then
    echo "post creation failed for $username ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
  fi
  post_id="$(printf "%s" "$HTTP_BODY" | extract_post_id)"
  log "created post for $username: $post_id"
  printf "%s" "$post_id"
}

ensure_reply() {
  local username="$1"
  local parent_id="$2"
  local content="$3"
  local jar
  local existing_id
  local post_id
  jar="$(jar_for "$username")"

  request "GET" "$jar" "/api/posts/$parent_id/replies?limit=100"
  if [[ "$HTTP_STATUS" == "200" ]]; then
    existing_id="$(printf "%s" "$HTTP_BODY" | find_reply_id_by_content "$content")"
    if [[ -n "$existing_id" ]]; then
      log "reply already exists for $username: $existing_id"
      printf "%s" "$existing_id"
      return
    fi
  fi

  request "POST" "$jar" "/api/posts" "$(json_post "$content" "" "$parent_id")"
  if [[ "$HTTP_STATUS" != "201" ]]; then
    echo "reply creation failed for $username ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
  fi
  post_id="$(printf "%s" "$HTTP_BODY" | extract_post_id)"
  log "created reply for $username: $post_id"
  printf "%s" "$post_id"
}

ensure_follow() {
  local follower="$1"
  local target="$2"
  local jar
  local already
  jar="$(jar_for "$follower")"

  request "GET" "$jar" "/api/users/$follower/following"
  already="$(printf "%s" "$HTTP_BODY" | is_following_target "$target")"
  if [[ "$already" == "1" ]]; then
    log "$follower already follows $target"
    return
  fi

  request "POST" "$jar" "/api/users/$target/follow"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    echo "follow failed: $follower -> $target ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
  fi
  log "$follower follows $target"
}

ensure_like() {
  local username="$1"
  local post_id="$2"
  local jar
  local liked
  jar="$(jar_for "$username")"

  request "GET" "$jar" "/api/posts/$post_id/like"
  liked="$(printf "%s" "$HTTP_BODY" | is_liked)"
  if [[ "$liked" == "1" ]]; then
    log "$username already liked $post_id"
    return
  fi

  request "POST" "$jar" "/api/posts/$post_id/like"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    echo "like failed: $username -> $post_id ($HTTP_STATUS): $HTTP_BODY" >&2
    exit 1
  fi
  log "$username liked $post_id"
}

require_cmd curl
require_cmd node

log "Seeding Breezy demo data on $BASE_URL"
log

ensure_account "breezy_demo" "Breezy Demo"
ensure_account "jury1" "Jury 1"
ensure_account "jury2" "Jury 2"

update_profile \
  "breezy_demo" \
  "Breezy Demo" \
  "Compte de demonstration Breezy : posts courts, media, tags et interactions." \
  "https://i.pravatar.cc/160?u=jury0" \
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" \
  "fr"

update_profile \
  "jury1" \
  "Jury 1" \
  "Compte jury pret pour tester le feed, les likes et les notifications." \
  "https://i.pravatar.cc/160?u=jury1" \
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80" \
  "fr"

update_profile \
  "jury2" \
  "Jury 2" \
  "Compte jury pret pour publier un Breeze et suivre les autres comptes." \
  "https://i.pravatar.cc/160?u=jury2" \
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80" \
  "fr"

post_welcome="$(ensure_post "breezy_demo" "Bienvenue sur Breezy ! 🌿 #breezy")"
post_media="$(ensure_post "breezy_demo" "Petit aperçu de la démo : un Breeze peut contenir du texte et une image. #breezy" "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80")"
post_feed="$(ensure_post "breezy_demo" "Astuce jury : suivez @breezy_demo puis publiez un Breeze pour voir le fil chronologique se remplir. #demo")"

if [[ "$SEED_INTERACTIONS" == "1" ]]; then
  log
  log "Seeding optional interactions..."
  ensure_follow "jury1" "breezy_demo"
  ensure_follow "jury2" "breezy_demo"
  ensure_follow "jury1" "jury2"
  ensure_follow "jury2" "jury1"
  ensure_like "jury1" "$post_welcome"
  ensure_like "jury2" "$post_media"
  reply_id="$(ensure_reply "jury1" "$post_welcome" "Super, le compte jury1 est prêt pour la demo !")"
  ensure_reply "breezy_demo" "$reply_id" "Merci @jury1, on valide aussi les réponses imbriquées."
  ensure_post "breezy_demo" "Mention de test pour les notifications : bienvenue @jury1 ! #breezy" >/dev/null
fi

cat <<EOF

Demo seed complete.

Accounts:
  breezy_demo / $(email_for "breezy_demo") / $DEMO_PASSWORD
  jury1     / $(email_for "jury1")     / $DEMO_PASSWORD
  jury2     / $(email_for "jury2")     / $DEMO_PASSWORD

Posts:
  breezy_demo welcome: $post_welcome
  breezy_demo media:   $post_media
  breezy_demo feed:    $post_feed

Usage:
  BASE_URL=http://localhost ./demo-seed.sh
  BASE_URL=https://breezy.ruets.fr SEED_INTERACTIONS=1 ./demo-seed.sh

EOF

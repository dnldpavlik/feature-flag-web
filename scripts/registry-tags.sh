#!/usr/bin/env bash
set -euo pipefail

# List container registry tags for GitLab projects.
#
# Usage:
#   ./scripts/registry-tags.sh                   # this project
#   ./scripts/registry-tags.sh <project-id>      # specific project
#   ./scripts/registry-tags.sh all               # all projects
#
# Requires: GITLAB_TOKEN env var (personal access token with read_registry scope)
# Configure: GITLAB_URL below to match your instance

GITLAB_URL="https://gitlab.donpavlik.com"
PROJECT_ID="${1:-4}"  # Default to this project's ID

if [ -z "${GITLAB_TOKEN:-}" ]; then
  echo "Error: GITLAB_TOKEN env var is required (personal access token with read_registry scope)"
  exit 1
fi

api() {
  curl -s --header "PRIVATE-TOKEN: $GITLAB_TOKEN" "$GITLAB_URL/api/v4$1"
}

list_tags() {
  local pid="$1"
  local project_name
  project_name=$(api "/projects/$pid" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).path_with_namespace)}catch{console.log('project-'+$pid)}})" 2>/dev/null)

  # Get container repositories for the project
  local repos
  repos=$(api "/projects/$pid/registry/repositories")

  if [ "$repos" = "[]" ] || [ -z "$repos" ]; then
    echo "  (no container repositories)"
    return
  fi

  echo "$repos" | node -e "
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    data.forEach(r => console.log(r.id + ' ' + r.path));
  " 2>/dev/null | while read -r repo_id repo_path; do
    echo ""
    echo "  $repo_path"
    echo "  $(printf '%.0s─' {1..60})"

    # Get tags sorted by newest first
    local tags
    tags=$(api "/registry/repositories/$repo_id/tags?per_page=20")

    echo "$tags" | node -e "
      const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      if (!data.length) { console.log('    (no tags)'); process.exit(); }
      // Sort: version tags first (descending), then sha tags, then latest
      const sorted = data.sort((a, b) => {
        if (a.name === 'latest') return 1;
        if (b.name === 'latest') return -1;
        const aVer = a.name.match(/^\d+\.\d+\.\d+/);
        const bVer = b.name.match(/^\d+\.\d+\.\d+/);
        if (aVer && !bVer) return -1;
        if (!aVer && bVer) return 1;
        return b.name.localeCompare(a.name, undefined, { numeric: true });
      });
      sorted.forEach(t => {
        const tag = t.name.padEnd(20);
        console.log('    ' + tag + (t.total_size ? '  ' + (t.total_size/1024/1024).toFixed(1) + ' MB' : ''));
      });
    " 2>/dev/null
  done
}

if [ "$PROJECT_ID" = "all" ]; then
  echo "Listing all projects with container registries..."
  echo ""

  projects=$(api "/projects?per_page=100&simple=true")
  echo "$projects" | node -e "
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    data.forEach(p => console.log(p.id));
  " 2>/dev/null | while read -r pid; do
    project_name=$(api "/projects/$pid" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).path_with_namespace)}catch{}})" 2>/dev/null)
    echo "[$project_name]"
    list_tags "$pid"
    echo ""
  done
else
  project_name=$(api "/projects/$PROJECT_ID" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).path_with_namespace)}catch{console.log('project-$PROJECT_ID')}})" 2>/dev/null)
  echo "[$project_name]"
  list_tags "$PROJECT_ID"
fi

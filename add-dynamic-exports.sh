#!/bin/bash

# Script to add dynamic export to all dashboard pages using Prisma

# Find all page.tsx files that import Prisma
pages=(
  "src/app/(dashboard)/projects/page.tsx"
  "src/app/(dashboard)/projects/[id]/page.tsx"
  "src/app/(dashboard)/projects/[id]/edit/page.tsx"
  "src/app/(dashboard)/projects/[id]/report/page.tsx"
  "src/app/(dashboard)/projects/[id]/stories/new/page.tsx"
  "src/app/(dashboard)/projects/[id]/stories/[storyId]/edit/page.tsx"
)

for page in "${pages[@]}"; do
  # Check if file exists and doesn't already have dynamic export
  if [ -f "$page" ] && ! grep -q "export const dynamic" "$page"; then
    echo "Adding dynamic export to $page"
    # Add after imports, before first export default
    sed -i '' '/^import/a\
\
// Force dynamic rendering - this page needs database access\
export const dynamic = '\''force-dynamic'\'';
' "$page" 2>/dev/null || true
  fi
done

echo "Done adding dynamic exports"

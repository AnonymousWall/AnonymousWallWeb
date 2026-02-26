#!/bin/bash
BUCKET_NAME="anonymouswall-prod-admin-frontend"
SRC_DIR="dist"

# Delete all existing objects in bucket first
echo "Clearing bucket..."
oci os object bulk-delete --bucket-name "$BUCKET_NAME" --force

# Upload HTML files
echo "Uploading HTML files..."
find "$SRC_DIR" -type f -name "*.html" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "text/html"
done

# Upload JS files
echo "Uploading JS files..."
find "$SRC_DIR" -type f -name "*.js" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "application/javascript"
done

# Upload CSS files
echo "Uploading CSS files..."
find "$SRC_DIR" -type f -name "*.css" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "text/css"
done

# Upload other assets
echo "Uploading other assets..."
find "$SRC_DIR" -type f ! -name "*.html" ! -name "*.js" ! -name "*.css" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file"
done

echo "Upload completed."
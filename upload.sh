#!/bin/bash
BUCKET_NAME="anonymouswall-prod-admin-frontend"
SRC_DIR="dist"

# 上传 HTML 文件
echo "Uploading HTML files..."
find "$SRC_DIR" -type f -name "*.html" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "text/html"
done

# 上传 JS 文件
echo "Uploading JS files..."
find "$SRC_DIR" -type f -name "*.js" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "application/javascript"
done

# 上传 CSS 文件
echo "Uploading CSS files..."
find "$SRC_DIR" -type f -name "*.css" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file" --content-type "text/css"
done

# 上传其他资源文件（图片、svg、json 等）
echo "Uploading other assets..."
find "$SRC_DIR" -type f ! -name "*.html" ! -name "*.js" ! -name "*.css" | while read file; do
  REL_PATH="${file#$SRC_DIR/}"
  oci os object put --bucket-name "$BUCKET_NAME" --name "$REL_PATH" --file "$file"
done

echo "Upload completed."
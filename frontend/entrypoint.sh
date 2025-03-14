#!/bin/sh
# Replace port in nginx.conf with the one provided by Cloud Run
sed -i.bak 's/listen 80/listen $PORT/g' /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
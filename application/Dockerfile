# ...existing code...
FROM nginx:stable-alpine

# Ensure system packages are updated at build time (reduces known CVEs)
RUN apk update && apk upgrade --no-cache

# Copy only the production static files
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# ...existing code...
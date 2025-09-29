# --- Production Stage ---
# Use the latest stable Nginx image on a minimal Alpine base for a smaller attack surface.
FROM nginx:stable-alpine

# Security Best Practice: Update and upgrade all OS packages to patch known vulnerabilities
# in the base image at build time. --no-cache reduces the final image size.
RUN apk update && apk upgrade --no-cache

# Copy the static website files into the default Nginx html directory.
COPY ./ /usr/share/nginx/html

# Expose port 80 for the Nginx web server.
EXPOSE 80

# The command to run when the container starts.
CMD ["nginx", "-g", "daemon off;"]
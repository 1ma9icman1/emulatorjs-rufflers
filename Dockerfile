# romM - ROM Manager & Web Emulator Station
# Built off official rommapp/romm
FROM rommapp/romm:latest

USER root

# Install embedded MariaDB on Alpine Linux for standalone zero-config cloud deployments
RUN apk add --no-cache mariadb mariadb-client mariadb-server-utils dos2unix

ENV PORT=8080
ENV HASHEOUS_API_ENABLED=true
ENV SCAN_WORKERS=4
ENV WEB_SERVER_CONCURRENCY=4

# Pre-load RomM configurations for NES & SNES Emulation
COPY config/config.yml /romm/config/config.yml
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN dos2unix /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]

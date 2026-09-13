# romM - ROM Manager & Web Emulator Station
# Built off official rommapp/romm
FROM rommapp/romm:latest

USER root

# Install embedded MariaDB server for standalone zero-config cloud deployments
RUN apt-get update && apt-get install -y --no-install-recommends \
    mariadb-server \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PORT=8080
ENV HASHEOUS_API_ENABLED=true
ENV SCAN_WORKERS=4
ENV WEB_SERVER_CONCURRENCY=4

# Pre-load RomM configurations for NES & SNES Emulation
COPY config/config.yml /romm/config/config.yml
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]

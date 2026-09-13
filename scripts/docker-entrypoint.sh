#!/bin/bash
set -e

echo "=== RomM Station Initializing ==="

# If no external DB_HOST is set, launch internal MariaDB
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; then
    echo "[RomM Self-Contained] Starting embedded MariaDB database engine..."
    
    # Initialize data dir if empty
    if [ ! -d "/var/lib/mysql/mysql" ]; then
        mysql_install_db --user=mysql --datadir=/var/lib/mysql > /dev/null 2>&1 || true
    fi
    
    # Start MariaDB service
    service mariadb start || /etc/init.d/mariadb start || mysqld_safe &
    sleep 3
    
    export ROMM_DB_DRIVER=mariadb
    export DB_HOST=127.0.0.1
    export DB_PORT=3306
    export DB_NAME=romm
    export DB_USER=romm
    export DB_PASSWD=rommpassword
    
    # Create database & grant user
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS romm; CREATE USER IF NOT EXISTS 'romm'@'127.0.0.1' IDENTIFIED BY 'rommpassword'; CREATE USER IF NOT EXISTS 'romm'@'localhost' IDENTIFIED BY 'rommpassword'; GRANT ALL PRIVILEGES ON romm.* TO 'romm'@'127.0.0.1'; GRANT ALL PRIVILEGES ON romm.* TO 'romm'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true
    echo "[RomM Self-Contained] Embedded MariaDB is ready."
fi

# Ensure Secret Key
if [ -z "$ROMM_AUTH_SECRET_KEY" ]; then
    export ROMM_AUTH_SECRET_KEY="b43f24ba5c3bf9ff1a53642da6fa2c9a1e675d4250d4f21414a9a8a8d18cf098"
fi

# Run standard RomM entrypoint
if [ -f "/entrypoint.sh" ]; then
    exec /entrypoint.sh "$@"
elif [ -f "/app/entrypoint.sh" ]; then
    exec /app/entrypoint.sh "$@"
else
    exec "$@"
fi

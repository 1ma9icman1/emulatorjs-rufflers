#!/bin/sh
set -e

echo "=== RomM Station Initializing ==="

# If no external DB_HOST is set, launch internal MariaDB
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; then
    echo "[RomM Self-Contained] Starting embedded MariaDB database engine..."
    
    mkdir -p /var/lib/mysql /run/mysqld
    chown -R mysql:mysql /var/lib/mysql /run/mysqld 2>/dev/null || true
    
    if [ ! -d "/var/lib/mysql/mysql" ]; then
        echo "[RomM Self-Contained] Initializing database files..."
        mariadb-install-db --user=mysql --datadir=/var/lib/mysql >/dev/null 2>&1 || mysql_install_db --user=mysql --datadir=/var/lib/mysql >/dev/null 2>&1 || true
    fi
    
    # Launch mysqld daemon in background
    mysqld --user=mysql --datadir=/var/lib/mysql --skip-networking=0 --bind-address=0.0.0.0 &
    
    # Wait for mysqld socket to be ready
    for i in $(seq 1 30); do
        if mysqladmin ping --silent 2>/dev/null; then
            break
        fi
        sleep 1
    done
    
    export ROMM_DB_DRIVER=mariadb
    export DB_HOST=127.0.0.1
    export DB_PORT=3306
    export DB_NAME=romm
    export DB_USER=romm
    export DB_PASSWD=rommpassword
    
    # Create database & grant user across localhost, 127.0.0.1, and %
    mariadb -u root << 'EOSQL' 2>/dev/null || mysql -u root << 'EOSQL' 2>/dev/null || true
CREATE DATABASE IF NOT EXISTS romm;
CREATE USER IF NOT EXISTS 'romm'@'localhost' IDENTIFIED BY 'rommpassword';
ALTER USER 'romm'@'localhost' IDENTIFIED BY 'rommpassword';
CREATE USER IF NOT EXISTS 'romm'@'127.0.0.1' IDENTIFIED BY 'rommpassword';
ALTER USER 'romm'@'127.0.0.1' IDENTIFIED BY 'rommpassword';
CREATE USER IF NOT EXISTS 'romm'@'%' IDENTIFIED BY 'rommpassword';
ALTER USER 'romm'@'%' IDENTIFIED BY 'rommpassword';
GRANT ALL PRIVILEGES ON *.* TO 'romm'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'romm'@'127.0.0.1' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'romm'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOSQL

    echo "[RomM Self-Contained] Embedded MariaDB is ready."
fi

# Ensure Secret Key
if [ -z "$ROMM_AUTH_SECRET_KEY" ]; then
    export ROMM_AUTH_SECRET_KEY="b43f24ba5c3bf9ff1a53642da6fa2c9a1e675d4250d4f21414a9a8a8d18cf098"
fi

# Execute original RomM entrypoint with /init
if [ -f "/docker-entrypoint.orig.sh" ]; then
    if [ $# -eq 0 ]; then
        exec /docker-entrypoint.orig.sh /init
    else
        exec /docker-entrypoint.orig.sh "$@"
    fi
elif [ -f "/init" ]; then
    exec /init "$@"
else
    exec "$@"
fi

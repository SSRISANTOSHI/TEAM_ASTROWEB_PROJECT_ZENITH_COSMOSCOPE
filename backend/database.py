import os
import logging
from urllib.parse import urlparse
import mysql.connector
from mysql.connector import pooling

logger = logging.getLogger("cosmoscope.database")

class DatabaseManager:
    def __init__(self):
        self.pool = None

    def init_app(self, app=None):
        # Retrieve and parse connection info
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            db_url = os.getenv("MYSQL_URL") or os.getenv("MYSQL_PUBLIC_URL")

        db_config = {}

        if db_url:
            parsed = urlparse(db_url)
            db_config["host"] = parsed.hostname
            db_config["port"] = parsed.port or 3306
            db_config["user"] = parsed.username
            db_config["password"] = parsed.password
            db_config["database"] = parsed.path.lstrip("/")
        else:
            # Fallback to individual MYSQL environment variables
            db_config["host"] = os.getenv("MYSQLHOST", "localhost")
            db_config["port"] = int(os.getenv("MYSQLPORT", "3306"))
            db_config["user"] = os.getenv("MYSQLUSER", "root")
            db_config["password"] = os.getenv("MYSQLPASSWORD", "password")
            db_config["database"] = os.getenv("MYSQLDATABASE", "cosmoscope")

        # Create connection pool
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name="cosmoscope_pool",
                pool_size=5,
                pool_reset_session=True,
                **db_config
            )
            logger.info("MySQL Connection Pool initialized successfully.")
            self.create_tables_if_not_exists()
        except mysql.connector.Error as err:
            logger.error("Failed to initialize MySQL Connection Pool: %s", err)
            raise err

    def get_connection(self):
        if not self.pool:
            raise RuntimeError("Database pool not initialized. Call init_app() first.")
        return self.pool.get_connection()

    def create_tables_if_not_exists(self):
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS location_queries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            lat DOUBLE NOT NULL,
            lon DOUBLE NOT NULL,
            csai DOUBLE NOT NULL,
            cloud_cover INT,
            visible_objects VARCHAR(500),
            queried_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(create_table_sql)
            conn.commit()
            logger.info("Table 'location_queries' verified/created.")
        except mysql.connector.Error as err:
            logger.error("Failed to create tables: %s", err)
            raise err
        finally:
            cursor.close()
            conn.close()

db = DatabaseManager()

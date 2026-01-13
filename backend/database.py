from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from .config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

# Check argument for SQLite
connect_args = {}
pool_args = {}

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args["check_same_thread"] = False
    if ":memory:" in SQLALCHEMY_DATABASE_URL:
        pool_args["poolclass"] = StaticPool

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    **pool_args
)

# Only attach SQLite pragma if using SQLite
if "sqlite" in SQLALCHEMY_DATABASE_URL:

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

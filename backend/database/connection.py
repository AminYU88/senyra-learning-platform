from sqlalchemy import create_engine

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import sessionmaker

from backend.config.settings import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}


# DATABASE ENGINE

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)


# DATABASE SESSION

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# BASE MODEL

Base = declarative_base()


# FASTAPI DATABASE DEPENDENCY

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

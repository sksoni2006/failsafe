from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# For rapid development, we will use SQLite. 
# Swap to the PostgreSQL URL below when you are ready for production.
SQLALCHEMY_DATABASE_URL = "sqlite:///./failsafe.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/failsafe_db"

# connect_args is only needed for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
# engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

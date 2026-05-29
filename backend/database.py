from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./failsafe.db"

# 1. Define the engine correctly (connect_args is required for SQLite)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 2. Bind the engine to the session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 3. Yield the database session properly
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
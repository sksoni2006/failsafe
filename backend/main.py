from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from database import engine, Base, get_db
import models
from core.security import get_password_hash, verify_password, create_access_token
from services.ml_service import process_student_csv
from pydantic import BaseModel

# Add this right below your imports
class UserCreate(BaseModel):
    email: str
    password: str

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FAILSAFE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register")
def register_faculty(user: UserCreate, db: Session = Depends(get_db)):
    """Creates a new faculty account using a JSON body."""
    # Notice we now use user.email and user.password
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Faculty registered successfully."}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Logs in and returns a JWT token."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# --- ML & DASHBOARD ENDPOINTS ---

@app.post("/api/predict/upload")
async def upload_student_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Processes CSV, generates predictions, and SAVES them to the database."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    predictions = process_student_csv(content)
    
    # Save each prediction to the database
    for pred in predictions:
        db_prediction = models.Prediction(
            student_id=pred["student_id"],
            at_risk_prediction=pred["at_risk_prediction"],
            risk_probability=pred["risk_probability"],
            top_risk_factors=pred["top_risk_factors"],
            recommended_interventions=pred["recommended_interventions"]
        )
        db.add(db_prediction)
    
    db.commit() # Commit all saves to the database
    
    return {"status": "success", "students_processed": len(predictions), "data": predictions}

@app.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    """Fetches all saved historical predictions for the frontend dashboard."""
    records = db.query(models.Prediction).all()
    return records
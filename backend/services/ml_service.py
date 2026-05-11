import joblib
import pandas as pd
import shap
from sklearn.preprocessing import LabelEncoder
import io

# Load the model and features into memory when the server starts
MODEL_PATH = "models/failsafe_xgboost_model.pkl"
FEATURES_PATH = "models/failsafe_expected_features.pkl"

model = joblib.load(MODEL_PATH)
expected_features = joblib.load(FEATURES_PATH)

# Initialize SHAP explainer
explainer = shap.TreeExplainer(model)

def generate_interventions(top_features):
    """Maps top SHAP risk features to actionable faculty interventions."""
    interventions = []
    
    for feature, impact in top_features:
        # We only care about features that are PUSHING the student toward risk (positive impact values)
        if impact > 0:
            if feature == 'absences':
                interventions.append("Action Required: Schedule a mandatory meeting with the academic counselor to discuss attendance.")
            elif feature == 'failures':
                interventions.append("Academic Support: Enroll student in mandatory peer tutoring sessions to catch up on fundamentals.")
            elif feature in ['goout', 'freetime', 'romantic']:
                interventions.append("Advising: Discuss time-management strategies and finding a balance between personal life and studies.")
            elif feature == 'health':
                interventions.append("Wellness Check: Reach out regarding the student's well-being and provide campus health center resources.")
            elif feature == 'studytime':
                interventions.append("Study Plan: Work with the student to create a structured weekly study schedule.")
            elif feature == 'higher': # If they don't want to go to higher education
                interventions.append("Career Counseling: Connect with a career advisor to discuss post-graduation goals and motivation.")
                
    # If no specific rules triggered, provide a default catch-all intervention
    if not interventions:
        interventions.append("General Intervention: Schedule an immediate academic check-in to discuss current semester progress.")
        
    # Return unique interventions only
    return list(set(interventions)) 

def process_student_csv(csv_content: bytes):
    """Parses uploaded CSV, pre-processes it to match training data, and runs predictions."""
    
    # 1. Read the CSV data into a Pandas DataFrame
    df = pd.read_csv(io.BytesIO(csv_content), sep=';') 
    
    # 2. PREPROCESSING (Replicating Phase 1)
    df_processed = df.copy()
    
    # Add 'subject' column if it's missing (default to 0 for Math)
    if 'subject' not in df_processed.columns:
        df_processed['subject'] = 0

    # Encode Binary Categorical Variables
    binary_cols = ['school', 'sex', 'address', 'famsize', 'Pstatus', 
                   'schoolsup', 'famsup', 'paid', 'activities', 'nursery', 
                   'higher', 'internet', 'romantic']
    
    le = LabelEncoder()
    for col in binary_cols:
        if col in df_processed.columns:
            df_processed[col] = le.fit_transform(df_processed[col].astype(str))

    # One-Hot Encode Nominal Categorical Variables
    nominal_cols = ['Mjob', 'Fjob', 'reason', 'guardian']
    cols_to_encode = [c for c in nominal_cols if c in df_processed.columns]
    df_processed = pd.get_dummies(df_processed, columns=cols_to_encode, drop_first=True)
    
    # 3. ALIGN FEATURES (Crucial Step)
    # The uploaded CSV might be missing some dummy columns (e.g., maybe no parent is a 'health' worker in this specific batch).
    # We reindex to match the EXACT columns XGBoost expects, filling missing ones with 0.
    X_input = df_processed.reindex(columns=expected_features, fill_value=0)
    
    # 4. Generate Predictions
    predictions = model.predict(X_input)
    probabilities = model.predict_proba(X_input)[:, 1] # Probability of being 'At Risk'
    
    # 5. Generate SHAP Values for Explainability
    shap_values = explainer(X_input)
    
    # 6. Format the output for the API response
    results = []
    for i in range(len(df)):
        student_shap = shap_values.values[i]
        feature_impacts = {expected_features[j]: float(student_shap[j]) for j in range(len(expected_features))}
        top_features = sorted(feature_impacts.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        recommended_actions = generate_interventions(top_features)
        
        student_identifier = int(df['student_id'].iloc[i]) if 'student_id' in df.columns else i + 1
        
        results.append({
            "student_id": student_identifier,
            "at_risk_prediction": int(predictions[i]),
            "risk_probability": round(float(probabilities[i]), 3),
            "top_risk_factors": [{"feature": feat, "impact": round(val, 3)} for feat, val in top_features],
            "recommended_interventions": recommended_actions # NEW: Appending the text to the JSON
        })
        
    return results
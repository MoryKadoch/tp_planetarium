import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

file_name = '../data_processing/transformed_planets_dataset.csv'
data = pd.read_csv(file_name)
transformed_data = pd.read_csv(file_name)

features = ['Num_Moons', 'Minerals', 'Gravity', 'Sunlight_Hours', 'Temperature', 'Rotation_Time', 'Water_Presence', 'Habitability_Score']
target = 'Colonisable'

X = transformed_data[features]
y = transformed_data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Modèle de Régression Logistique
logistic_model_balanced = LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced')
logistic_model_balanced.fit(X_train, y_train)

y_pred_logistic_balanced = logistic_model_balanced.predict(X_test)
accuracy_logistic_balanced = accuracy_score(y_test, y_pred_logistic_balanced)
classification_rep_logistic_balanced = classification_report(y_test, y_pred_logistic_balanced)

print(f"Logistic Regression Accuracy: {accuracy_logistic_balanced}")
print("Logistic Regression Classification Report:")
print(classification_rep_logistic_balanced)

y_probs = logistic_model_balanced.predict_proba(X_test)[:, 1]
thresholds = np.arange(0.1, 0.9, 0.1)
for threshold in thresholds:
    y_pred_threshold = (y_probs >= threshold).astype(int)
    accuracy = accuracy_score(y_test, y_pred_threshold)
    classification_rep = classification_report(y_test, y_pred_threshold)
    print(f"Threshold: {threshold}")
    print(f"Accuracy: {accuracy}")
    print(classification_rep)
    print("-" * 60)
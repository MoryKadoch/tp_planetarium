import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

file_name = '../data_processing/transformed_planets_dataset.csv'
data = pd.read_csv(file_name)
transformed_data = pd.read_csv(file_name)

features = ['Num_Moons', 'Minerals', 'Gravity', 'Sunlight_Hours', 'Temperature', 'Rotation_Time', 'Water_Presence', 'Habitability_Score']
target = 'Colonisable'

X = transformed_data[features]
y = transformed_data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Modèle RandomForest
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
classification_rep = classification_report(y_test, y_pred)

print(f"RandomForest Accuracy: {accuracy}")
print("RandomForest Classification Report:")
print(classification_rep)
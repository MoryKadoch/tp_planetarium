import pandas as pd
from sklearn.preprocessing import MinMaxScaler

file_name = 'C:\\Users\\chama\\Downloads\\planets_dataset.csv'
data = pd.read_csv(file_name)

# Nettoyage des Données
print("Valeurs manquantes par colonne :")
print(data.isnull().sum())

print("\nStatistiques descriptives :")
print(data.describe())

columns_to_normalize = ['Num_Moons', 'Minerals', 'Gravity', 'Sunlight_Hours', 'Temperature', 'Rotation_Time']
scaler = MinMaxScaler()
data[columns_to_normalize] = scaler.fit_transform(data[columns_to_normalize])

data['Habitability_Score'] = (
    0.3 * data['Water_Presence'] +
    0.2 * (1 - abs(data['Temperature'] - 0.5)) +
    0.3 * data['Gravity'] +
    0.2 * data['Sunlight_Hours']
)

print("\nDataset avec le nouvel indicateur d'habitabilité :")
print(data.head())

data.to_csv('transformed_planets_dataset.csv', index=False)
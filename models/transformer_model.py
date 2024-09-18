import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers

file_name = '../data_processing/transformed_planets_dataset.csv'
data = pd.read_csv(file_name)
transformed_data = pd.read_csv(file_name)

features = ['Num_Moons', 'Minerals', 'Gravity', 'Sunlight_Hours', 'Temperature', 'Rotation_Time', 'Water_Presence', 'Habitability_Score']
target = 'Colonisable'

X = transformed_data[features]
y = transformed_data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

input_shape = (8,)

def transformer_encoder(inputs, head_size, num_heads, ff_dim, dropout=0):
    x = layers.LayerNormalization(epsilon=1e-6)(inputs)
    x = layers.MultiHeadAttention(key_dim=head_size, num_heads=num_heads, dropout=dropout)(x, x)
    x = layers.Dropout(dropout)(x)
    res = x + inputs
    x = layers.LayerNormalization(epsilon=1e-6)(res)
    x = layers.Dense(ff_dim, activation="relu")(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Dense(inputs.shape[-1])(x)
    return x + res

def build_transformer_model(input_shape, head_size, num_heads, ff_dim, num_transformer_blocks, mlp_units, dropout=0, mlp_dropout=0):
    inputs = layers.Input(shape=input_shape)
    x = inputs
    for _ in range(num_transformer_blocks):
        x = transformer_encoder(x, head_size, num_heads, ff_dim, dropout)
    x = layers.Flatten()(x)
    for dim in mlp_units:
        x = layers.Dense(dim, activation="relu")(x)
        x = layers.Dropout(mlp_dropout)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)
    return tf.keras.Model(inputs, outputs)

transformer_model = build_transformer_model(
    input_shape=(input_shape[0], 1),
    head_size=256,
    num_heads=4,
    ff_dim=64,
    num_transformer_blocks=4,
    mlp_units=[128, 64],
    dropout=0.25,
    mlp_dropout=0.25,
)

transformer_model.compile(
    loss="binary_crossentropy",
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    metrics=["accuracy"],
)

transformer_model.summary()

X_train_transformed = np.expand_dims(X_train.values, axis=-1)
X_test_transformed = np.expand_dims(X_test.values, axis=-1)

transformer_model.fit(
    X_train_transformed,
    y_train,
    validation_split=0.2,
    epochs=50,
    batch_size=32,
)

test_loss, test_accuracy = transformer_model.evaluate(X_test_transformed, y_test)
print(f"Transformer Test Accuracy: {test_accuracy}")

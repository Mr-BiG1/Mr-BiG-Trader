import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta

def train_price_model(data):
    df = pd.DataFrame(data)

    # Ensure proper type
    df['close'] = df['close'].astype(float)

    # Use index as time step
    df['time_step'] = np.arange(len(df))

    # Features & target
    X = df[['time_step']]
    y = df['close']

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model = LinearRegression()
    model.fit(X_train, y_train)

    # Predict the next time step
    next_step = np.array([[len(df)]])
    next_price = model.predict(next_step)[0]

    return {
        "next_price": round(next_price, 2),
        "latest_price": round(df['close'].iloc[-1], 2),
        "confidence": round(model.score(X_test, y_test), 3)  # R² score
    }

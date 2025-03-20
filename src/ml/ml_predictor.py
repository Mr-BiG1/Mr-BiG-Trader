# import os
# import pandas as pd
# import numpy as np
# from sklearn.linear_model import LinearRegression
# import matplotlib.pyplot as plt
# import joblib

# def train_model():
#     # Get absolute path to the CSV file
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     csv_path = os.path.join(base_dir, '..', '..', 'data', 'historical_data.csv')
#     csv_path = os.path.abspath(csv_path)

#     df = pd.read_csv(csv_path)

#     if 'close' not in df.columns:
#         raise ValueError("CSV must contain a 'close' column")

#     # Use previous close prices to predict the next
#     df['target'] = df['close'].shift(-1)
#     df.dropna(inplace=True)

#     X = df[['close']]
#     y = df['target']

#     model = LinearRegression()
#     model.fit(X, y)

#     joblib.dump(model, os.path.join(base_dir, 'ml_model.pkl'))
#     print("✅ Model trained and saved.")

# def predict_next(price):
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     model_path = os.path.join(base_dir, 'ml_model.pkl')
#     model = joblib.load(model_path)
#     predicted_price = model.predict(np.array([[price]]))
#     return float(predicted_price[0])

# if __name__ == "__main__":
#     train_model()
#     print(f"📈 Next price prediction: ${predict_next(187.50):.2f}")
    
import sys
import os
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.linear_model import LinearRegression
import joblib

def train_model(symbol):
    df = yf.download(symbol, period="60d", interval="1d")  # Last 60 days
    if 'Close' not in df.columns:
        raise ValueError("Downloaded data missing 'Close' column")
    
    df = df[['Close']].rename(columns={'Close': 'close'})
    df['target'] = df['close'].shift(-1)
    df.dropna(inplace=True)

    X = df[['close']]
    y = df['target']

    model = LinearRegression()
    model.fit(X, y)

    # Save model per symbol
    model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')
    joblib.dump(model, model_path)

def predict_next(symbol, price):
    model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')
    if not os.path.exists(model_path):
        train_model(symbol)

    model = joblib.load(model_path)
    predicted_price = model.predict(np.array([[float(price)]]))
    return float(predicted_price[0])

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ml_predictor.py SYMBOL CURRENT_PRICE")
        sys.exit(1)

    symbol = sys.argv[1]
    current_price = sys.argv[2]

    try:
        prediction = predict_next(symbol, current_price)
        print(f"📈 Next price prediction: ${prediction:.2f}")
    except Exception as e:
        print(f"ML Error: {str(e)}")


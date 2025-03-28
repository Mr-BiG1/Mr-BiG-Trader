# import sys
# import os
# import pandas as pd
# import numpy as np
# import yfinance as yf
# from sklearn.linear_model import LinearRegression
# import joblib

# def train_model(symbol):
#     df = yf.download(symbol, period="60d", interval="1d")  # Last 60 days
#     if 'Close' not in df.columns:
#         raise ValueError("Downloaded data missing 'Close' column")
    
#     df = df[['Close']].rename(columns={'Close': 'close'})
#     df['target'] = df['close'].shift(-1)
#     df.dropna(inplace=True)

#     X = df[['close']]
#     y = df['target']

#     model = LinearRegression()
#     model.fit(X, y)

#     # Save model per symbol
#     model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')
#     joblib.dump(model, model_path)

# def predict_next(symbol, price):
#     model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')
#     if not os.path.exists(model_path):
#         train_model(symbol)

#     model = joblib.load(model_path)
#     predicted_price = model.predict(np.array([[float(price)]]))
#     return float(predicted_price[0])

# if __name__ == "__main__":
#     if len(sys.argv) < 3:
#         print("Usage: python ml_predictor.py SYMBOL CURRENT_PRICE")
#         sys.exit(1)

#     symbol = sys.argv[1]
#     current_price = sys.argv[2]

#     try:
#         prediction = predict_next(symbol, current_price)
#         print(f"📈 Next price prediction: ${prediction:.2f}")
#     except Exception as e:
#         print(f"ML Error: {str(e)}")


import sys
import os
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.linear_model import LinearRegression
import joblib

def train_model(symbol):
    df = yf.download(symbol, period="60d", interval="1d")

    if df.empty or 'Close' not in df.columns:
        raise ValueError(f"Failed to fetch data for {symbol}. DataFrame is empty or missing 'Close' column.")

    df = df[['Close']].rename(columns={'Close': 'close'})
    df['target'] = df['close'].shift(-1)
    df.dropna(inplace=True)

    if df.shape[0] < 10:
        raise ValueError(f"Not enough data to train model for {symbol}. Only {df.shape[0]} records available.")

    X = df[['close']]
    y = df['target']

    model = LinearRegression()
    model.fit(X, y)

    model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')
    joblib.dump(model, model_path)

def predict_next(symbol, price):
    model_path = os.path.join(os.path.dirname(__file__), f'ml_model_{symbol}.pkl')

    if not os.path.exists(model_path):
        train_model(symbol)

    model = joblib.load(model_path)

    price = float(price)
    if np.isnan(price):
        raise ValueError("Current price is NaN. Cannot predict.")

    predicted_price = model.predict(np.array([[price]]))
    return float(predicted_price[0])

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ml_predictor.py SYMBOL CURRENT_PRICE")
        sys.exit(1)

    symbol = sys.argv[1].upper()
    current_price = sys.argv[2]

    try:
        if current_price.lower() in ['nan', 'none', '', 'null']:
            raise ValueError("Invalid input: current price is not a number.")

        prediction = predict_next(symbol, current_price)
        print(f"${prediction:.2f}")
    except Exception as e:
        print(f"ML Error: {str(e)}")
        sys.exit(1)

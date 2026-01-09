import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import os

class Forecaster:
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Error: {self.data_path} not found.")
            return
        
        # Load data and parse dates
        self.df = pd.read_csv(self.data_path)
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        # Ensure data is sorted by date
        self.df = self.df.sort_values('Date')

    def get_forecast(self, sku=None, days=6):
        """
        sku: Optional SKU to filter by.
        days: Number of future periods to forecast.
        """
        if self.df is None:
            return []

        # Filter by SKU if provided
        if sku:
            df_target = self.df[self.df['SKU'] == sku].copy()
        else:
            # Global demand if no product selected
            df_target = self.df.groupby('Date')[['Quantity_Sold']].sum().reset_index()

        if df_target.empty:
            return []

        # Aggregate daily/monthly sales
        # Assuming one record per date per SKU or already aggregated
        sales_series = df_target.set_index('Date')['Quantity_Sold']
        
        # We need at least 2 points for a simple trend, but ARIMA usually needs more
        # If too little data, return just the history
        history = []
        for d, v in sales_series.items():
            history.append({
                'date': d.strftime('%Y-%m-%d'),
                'sales': int(v),
                'type': 'history'
            })

        forecast_data = []
        if len(sales_series) >= 3:
            try:
                # Train ARIMA(1,1,0) - simple for small datasets
                model = ARIMA(sales_series.values, order=(1, 1, 0))
                model_fit = model.fit()
                
                # Forecast
                forecast = model_fit.forecast(steps=days)
                
                # Generate future dates
                last_date = sales_series.index.max()
                # Assuming monthly if dates are 1st of month, else daily
                # Let's detect frequency or default to daily
                freq = 'MS' if sales_series.index[1].day == sales_series.index[0].day else 'D'
                future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=days, freq=freq)

                for d, v in zip(future_dates, forecast):
                    forecast_data.append({
                        'date': d.strftime('%Y-%m-%d'),
                        'sales': max(0, int(v)),
                        'type': 'forecast'
                    })
            except Exception as e:
                print(f"Forecasting error: {e}")
                # Fallback: simple average/trend if ARIMA fails
                pass

        return history + forecast_data

if __name__ == "__main__":
    f = Forecaster("jewelry_combined.csv")
    print(f.get_forecast("RJ0001"))

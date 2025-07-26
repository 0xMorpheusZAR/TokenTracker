# Altcoin Lead-Lag Analysis Toolkit
# Complete project structure with all required files

# ============================================================================
# FILE: config.yml
# ============================================================================
"""
# === Global parameters ===
start_date: "2019-01-01"
end_date: "2025-07-31"
frequency: "W"              # D = daily, W = weekly
lookback_volume_days: 90    # Quality filter: trailing‑90d median value
min_liquidity_usd: 10_000_000
top_n_marketcap: 300        # Only evaluate first 300 coins each snap
cache_dir: "cache/"
results_dir: "results/"

# Regression settings
target: "others_btc_ret"    # dependent variable
independent:
  - "eth_btc_ret"
  - "btc_dom_change"
  - "quality_alpha"
  - "macro_liquidity"
lag_weeks: 1                # ETH/BTC lag for lead‑lag test

# Coin lists (over‑ride as needed)
stablecoin_symbols: ["USDT", "USDC", "DAI", "BUSD", "TUSD"]

# Logging
log_level: "INFO"
"""

# ============================================================================
# FILE: requirements.txt
# ============================================================================
"""
pandas>=2.2
numpy>=1.25
pycoingecko>=3.1.0
statsmodels>=0.14
yfinance>=0.2
tqdm>=4.66
PyYAML>=6.0
"""

# ============================================================================
# FILE: data_prep.py
# ============================================================================
"""
Fetch & cache market‑cap / price data from CoinGecko + macro data.
Outputs a single harmonised DataFrame saved under cache_dir/master.parquet
© 2025 Ferdinand C.  MIT Licence
"""
import os, json, datetime as dt, logging, pickle
from typing import List, Dict

import pandas as pd
import numpy as np
import yaml
from pycoingecko import CoinGeckoAPI
import yfinance as yf
from tqdm import tqdm

# --------------------------------------------------------------------------- #
# Config & Logging
# --------------------------------------------------------------------------- #
with open("config.yml") as f:
    CFG = yaml.safe_load(f)

os.makedirs(CFG["cache_dir"], exist_ok=True)
logging.basicConfig(
    level=getattr(logging, CFG["log_level"]),
    format="%(asctime)s  %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)

CG = CoinGeckoAPI()

# --------------------------------------------------------------------------- #
# Helper – fetch coin **market cap** history (USD)
# --------------------------------------------------------------------------- #
def get_coin_marketcap(coin_id: str, start: dt.date, end: dt.date) -> pd.Series:
    """Returns a daily Series of market‑cap (USD)."""
    cache_fn = f"{CFG['cache_dir']}/{coin_id}_{start}_{end}.pkl"
    if os.path.exists(cache_fn):
        return pd.read_pickle(cache_fn)

    logging.info(f"Pulling {coin_id} history from CoinGecko…")
    unixts_from = int(dt.datetime.combine(start, dt.time()).timestamp())
    unixts_to   = int(dt.datetime.combine(end,   dt.time()).timestamp())
    data = CG.get_coin_market_chart_range_by_id(
        coin_id,      vs_currency="usd",
        from_timestamp=unixts_from,
        to_timestamp=unixts_to,
    )
    # CoinGecko returns [[ts_ms, value], …]
    mkt_cap = pd.Series(
        {dt.datetime.utcfromtimestamp(p[0] / 1e3): p[1] for p in data["market_caps"]}
    )
    mkt_cap.name = coin_id
    mkt_cap.to_pickle(cache_fn)
    return mkt_cap


def get_total_marketcap(start: dt.date, end: dt.date) -> pd.Series:
    """Fetch global crypto mkt‑cap."""
    cache_fn = f"{CFG['cache_dir']}/GLOBAL_{start}_{end}.pkl"
    if os.path.exists(cache_fn):
        return pd.read_pickle(cache_fn)

    logging.info("Pulling GLOBAL mkt‑cap from CoinGecko…")
    unixts_from = int(dt.datetime.combine(start, dt.time()).timestamp())
    unixts_to   = int(dt.datetime.combine(end,   dt.time()).timestamp())
    data = CG.get_global_market_chart_range(
        vs_currency="usd",
        from_timestamp=unixts_from,
        to_timestamp=unixts_to,
    )
    glob = pd.Series(
        {dt.datetime.utcfromtimestamp(p[0] / 1e3): p[1] for p in data["market_cap"]}
    )
    glob.name = "TOTAL"
    glob.to_pickle(cache_fn)
    return glob


def get_macro_liquidity(start: dt.date, end: dt.date) -> pd.Series:
    """
    Simple macro proxy = S&P 500 total‑return index %Δ
    You can swap for Fed Funds, M2, or custom liquidity index.
    """
    spx = yf.download("^SPXTR", start=start, end=end, progress=False)["Adj Close"]
    sret = spx.pct_change().fillna(0)
    sret.name = "macro_liquidity"
    return sret


# --------------------------------------------------------------------------- #
# Build master DataFrame
# --------------------------------------------------------------------------- #
def build_master():
    start = dt.datetime.fromisoformat(CFG["start_date"]).date()
    end   = dt.datetime.fromisoformat(CFG["end_date"]).date()

    logging.info("Fetching BTC & ETH cores …")
    btc_cap = get_coin_marketcap("bitcoin", start, end)
    eth_cap = get_coin_marketcap("ethereum", start, end)
    total   = get_total_marketcap(start, end)

    # Intersect indices, convert to pandas DataFrame
    df = pd.concat([btc_cap, eth_cap, total], axis=1).dropna()
    df.rename(columns={"bitcoin": "BTC_CAP", "ethereum": "ETH_CAP", "TOTAL": "TOTAL_CAP"},
              inplace=True)

    # Others cap = TOTAL – BTC – ETH
    df["OTHERS_CAP"] = df["TOTAL_CAP"] - df["BTC_CAP"] - df["ETH_CAP"]

    # Dominance %
    df["BTC_DOM"] = df["BTC_CAP"] / df["TOTAL_CAP"]
    df["ETH_DOM"] = df["ETH_CAP"] / df["TOTAL_CAP"]

    # Macro
    logging.info("Fetching macro liquidity proxy …")
    macro = get_macro_liquidity(start, end)
    df = df.join(macro, how="left")

    # Resample to desired frequency
    freq = CFG["frequency"]
    df = df.resample(freq).last().dropna()

    df.to_parquet(f"{CFG['cache_dir']}/master.parquet")
    logging.info(f"Master DF saved: {df.shape[0]} rows × {df.shape[1]} cols")


if __name__ == "__main__":
    build_master()

# ============================================================================
# FILE: factor_library.py
# ============================================================================
"""
Generate derived factors / indices, incl. quality‑filtered TOTAL3.
Every function accepts a DataFrame from data_prep.master and returns Series.
"""
import pandas as pd
import numpy as np
import yaml, datetime as dt, logging, os
from typing import List

with open("config.yml") as f:
    CFG = yaml.safe_load(f)

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")

# --------------------------------------------------------------------------- #
# Quality filter utilities
# --------------------------------------------------------------------------- #
def load_top_market_caps(date: pd.Timestamp, n: int) -> pd.Series:
    """
    Pull top‑N market‑cap snapshot as of *date* (daily).
    Uses CoinGecko 'coins/markets' endpoint; caches JSON per day.
    """
    from pycoingecko import CoinGeckoAPI
    cg = CoinGeckoAPI()

    cache_fn = f"{CFG['cache_dir']}/snap_{date.date()}.pkl"
    if os.path.exists(cache_fn):
        snap = pd.read_pickle(cache_fn)
    else:
        snap = pd.DataFrame(
            cg.get_coins_markets(
                vs_currency="usd", order="market_cap_desc",
                per_page=250, page=1, price_change_percentage=None,
                date=date.strftime("%d-%m-%Y")
            )
        )
        snap.to_pickle(cache_fn)

    snap = snap.set_index("symbol")["market_cap"].astype(float).nlargest(n)
    return snap


def make_quality_mask(master: pd.DataFrame) -> pd.Series:
    """
    Binary mask per date: 1 if 'OTHERS' is majority high‑liquidity tokens.
    Approach: compute aggregated market‑cap of tokens that pass liquidity rule.
    """
    mask = []
    n = CFG["top_n_marketcap"]
    min_liquidity = CFG["min_liquidity_usd"]

    for ts in master.index:
        snap = load_top_market_caps(ts, n)
        qualified = snap[snap > min_liquidity]
        qual_cap = qualified.sum()
        raw_others = master.loc[ts, "OTHERS_CAP"]
        mask.append(qual_cap / raw_others if raw_others else 0.0)

    return pd.Series(mask, index=master.index, name="quality_ratio")


# --------------------------------------------------------------------------- #
# Factor generators
# --------------------------------------------------------------------------- #
def compute_factors(master: pd.DataFrame) -> pd.DataFrame:
    df = master.copy()

    # Core ratios
    df["ETH_BTC"] = df["ETH_CAP"] / df["BTC_CAP"]
    df["OTHERS_BTC"] = df["OTHERS_CAP"] / df["BTC_CAP"]
    df["OTHERS_ETH"] = df["OTHERS_CAP"] / df["ETH_CAP"]

    # Returns (pct change)
    df["eth_btc_ret"]    = df["ETH_BTC"].pct_change()
    df["others_btc_ret"] = df["OTHERS_BTC"].pct_change()

    # BTC dominance change
    df["btc_dom_change"] = df["BTC_DOM"].diff()

    # Macro already is daily return; resample earlier
    df["macro_liquidity"] = df["macro_liquidity"].rolling(window=4).mean()

    # Quality alpha
    logging.info("Computing quality ratio & alpha … (slow first time)")
    qrat = make_quality_mask(df)
    df = df.join(qrat, how="left")
    df["quality_alpha"] = (df["quality_ratio"] - df["quality_ratio"].shift()).fillna(0)

    # Final cleanup
    return df.dropna(subset=["eth_btc_ret", "others_btc_ret"])


if __name__ == "__main__":
    master = pd.read_parquet(f"{CFG['cache_dir']}/master.parquet")
    factors = compute_factors(master)
    factors.to_parquet(f"{CFG['cache_dir']}/factors.parquet")
    print(f"Built factors DF: {factors.shape}")

# ============================================================================
# FILE: model.py
# ============================================================================
"""
Run OLS regression + optional lag test.
Usage:
    python model.py --rebuild      # rebuild data + run model
    python model.py                # assume cached parquet files
"""
import argparse, logging, yaml, os
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.stattools import grangercausalitytests

# ----------------------------------------------------------------------------
with open("config.yml") as f:
    CFG = yaml.safe_load(f)

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")


def load_or_build():
    from data_prep import build_master
    from factor_library import compute_factors

    if os.path.exists(f"{CFG['cache_dir']}/factors.parquet"):
        return pd.read_parquet(f"{CFG['cache_dir']}/factors.parquet")
    else:
        build_master()
        master = pd.read_parquet(f"{CFG['cache_dir']}/master.parquet")
        factors = compute_factors(master)
        factors.to_parquet(f"{CFG['cache_dir']}/factors.parquet")
        return factors


def run_regression(df: pd.DataFrame):
    y = df[CFG["target"]]
    X = df[CFG["independent"]]
    X = sm.add_constant(X)
    model = sm.OLS(y, X).fit()
    logging.info("\n" + model.summary().as_text())

    # Save coeffs
    coef_path = f"{CFG['results_dir']}/coefficients.csv"
    os.makedirs(CFG["results_dir"], exist_ok=True)
    model.params.to_csv(coef_path, header=["coef"])
    logging.info(f"Coefficients saved to {coef_path}")

    return model


def lead_lag_test(df: pd.DataFrame):
    lag = CFG["lag_weeks"]
    df_lag = df.copy()
    df_lag["eth_btc_ret_lag"] = df_lag["eth_btc_ret"].shift(lag)
    df_lag = df_lag.dropna()

    test = grangercausalitytests(
        df_lag[["others_btc_ret", "eth_btc_ret"]], maxlag=lag, verbose=False
    )
    pval = test[lag][0]["ssr_ftest"][1]
    logging.info(f"Granger causality p‑value (ETH→Alt, lag={lag}): {pval:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true")
    args = parser.parse_args()

    if args.rebuild:
        if os.path.exists(f"{CFG['cache_dir']}/factors.parquet"):
            os.remove(f"{CFG['cache_dir']}/factors.parquet")

    data = load_or_build()
    model = run_regression(data)
    lead_lag_test(data)

# ============================================================================
# FILE: notebooks/lead_lag_tests.ipynb (Python code for Jupyter)
# ============================================================================
"""
# Lead-Lag Analysis Notebook

import sys
sys.path.append('..')

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from factor_library import compute_factors
from model import run_regression, lead_lag_test

# Load data
df = pd.read_parquet("../cache/factors.parquet")

# Visualize lead-lag relationship
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# Plot 1: Raw time series
ax1.plot(df.index, df["OTHERS_BTC"], label="OTHERS/BTC Ratio")
ax1.plot(df.index, df["ETH_BTC"], label="ETH/BTC Ratio")
ax1.set_ylabel("Ratio")
ax1.legend()
ax1.set_title("Altcoin and ETH Performance vs BTC")

# Plot 2: Returns with lag
ax2.plot(df.index, df["others_btc_ret"], label="Alt vs BTC Returns", alpha=0.7)
ax2.plot(df.index[1:], df["eth_btc_ret"].shift(1)[1:], 
         label="ETH/BTC Returns (1-week lag)", alpha=0.7)
ax2.set_ylabel("Returns")
ax2.legend()
ax2.set_title("Lead-Lag Relationship: ETH Leading Alts")

plt.tight_layout()
plt.show()

# Correlation matrix
corr_df = df[["eth_btc_ret", "others_btc_ret", "btc_dom_change", 
              "quality_alpha", "macro_liquidity"]].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr_df, annot=True, cmap='coolwarm', center=0)
plt.title("Factor Correlation Matrix")
plt.show()

# Rolling correlation
rolling_corr = df["eth_btc_ret"].rolling(26).corr(df["others_btc_ret"])
plt.figure(figsize=(12, 5))
plt.plot(df.index, rolling_corr)
plt.axhline(y=0, color='r', linestyle='--', alpha=0.5)
plt.title("26-Week Rolling Correlation: ETH/BTC vs OTHERS/BTC")
plt.ylabel("Correlation")
plt.show()
"""

# ============================================================================
# Setup Instructions
# ============================================================================
"""
SETUP INSTRUCTIONS:

1. Create project directory:
   mkdir altcoin-lead-lag
   cd altcoin-lead-lag

2. Save each file section to its respective filename:
   - config.yml
   - requirements.txt  
   - data_prep.py
   - factor_library.py
   - model.py
   - notebooks/lead_lag_tests.ipynb (create notebooks folder first)

3. Create virtual environment:
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

4. Install dependencies:
   pip install -r requirements.txt

5. Run the analysis:
   python model.py --rebuild

This will:
- Fetch historical data from CoinGecko and Yahoo Finance
- Build the master dataset with BTC, ETH, and altcoin market caps
- Generate factors including quality-filtered metrics
- Run OLS regression to identify relationships
- Perform Granger causality test for lead-lag analysis
- Save results to the results/ directory

Note: First run will be slow as it fetches and caches all historical data.
Subsequent runs will use cached data unless --rebuild flag is used.
"""
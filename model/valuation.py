# Implementation of Black-Scholes formula in Python
import numpy as np
from scipy.stats import norm

def blackScholes(S, K, T, sigma, r):
    "Calculate BS price of call/put"
    d1 = (np.log(S/K) + (r + sigma**2/2)*T)/(sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    try:
        call_value = S*norm.cdf(d1, 0, 1) - K*np.exp(-r*T)*norm.cdf(d2, 0, 1)
        put_value = K*np.exp(-r*T)*norm.cdf(-d2, 0, 1) - S*norm.cdf(-d1, 0, 1)

        # Put and call value will equate to 0 for small values.
        call_value = round(call_value, 2)
        put_value = round(put_value, 2)
        return call_value, put_value
    except:
        raise Exception("Error occurred during calculation.")
import base64
import io
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import urllib

from matplotlib.colors import LinearSegmentedColormap
from scipy.stats import norm

matplotlib.use('Agg')

def blackScholes(S, K, T, sigma, r):
    "Calculate BS price of call/put"
    d1 = (np.log(S/K) + (r + sigma**2/2)*T)/(sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    try:
        call_value = S*norm.cdf(d1, 0, 1) - K*np.exp(-r*T)*norm.cdf(d2, 0, 1)
        put_value = K*np.exp(-r*T)*norm.cdf(-d2, 0, 1) - S*norm.cdf(-d1, 0, 1)

        # Put and call value will equate to 0 for small values.
        if isinstance(call_value, np.floating):
            print(call_value)
            call_value = "%.2f" % round(call_value, 2)
        if isinstance(put_value, np.floating):
            put_value = "%.2f" % round(put_value, 2)
        print(call_value, put_value)
        return call_value, put_value
    except:
        raise Exception("Error occurred during calculation.")

def create_heatmap(min_spot_price, max_spot_price, min_time, max_time, K, r, sigma):
    price = np.linspace(min_spot_price, max_spot_price, num=8, endpoint=True)
    time = np.linspace(min_time, max_time, num=8, endpoint=True)
    S, T = np.meshgrid(price, time)

    C = np.zeros_like(S)
    P = np.zeros_like(S)

    for i in range(S.shape[0]):
        for j in range(S.shape[1]):
            C[i, j], P[i,j] = blackScholes(S[i, j], K, T[i, j], sigma, r)

    call_uri = generate_plot(S, T, C, min_time, max_time, min_spot_price, max_spot_price, 'Call')
    put_uri = generate_plot(S, T, P, min_time, max_time, min_spot_price, max_spot_price, 'Put')
    return call_uri, put_uri

def generate_plot(S, T, O, min_time, max_time, min_spot_price, max_spot_price, heatmap_type):
    cmap = LinearSegmentedColormap.from_list("red_green", ["red", "green"], N=256)
    plt.figure(figsize=(22, 18))
    plt.contourf(S, T, O, cmap=cmap)

    plt.colorbar(label=f'{heatmap_type} Price')
    plt.title(f'{heatmap_type} Option Price Heatmap')
    plt.xlabel('Spot Price')
    plt.ylabel('Time to Maturity')

    for i in range(S.shape[0] - 1):
        for j in range(S.shape[1] - 1):
            mid_x = (S[i, j] + S[i, j + 1]) / 2
            mid_y = (T[i, j] + T[i + 1, j]) / 2
            plt.text(mid_x, mid_y, f'{O[i, j]:.2f}', ha='center', va='center', color='black', fontsize=22, bbox=dict(facecolor='white', alpha=0.5, edgecolor='none'))

    plt.ylim(min_time, max_time)
    plt.yticks(np.around(np.linspace(min_time, max_time, num=10, endpoint=True), 2))
    plt.xlim(min_spot_price, max_spot_price)
    plt.xticks(np.around(np.linspace(min_spot_price, max_spot_price, num=10, endpoint=True), 2))
    plt.rcParams['axes.labelsize'] = 35
    plt.rcParams['axes.titlesize'] = 55
    plt.rcParams['font.size'] = 25
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    string = base64.b64encode(buf.read())
    uri = urllib.parse.quote(string)
    plt.close()
    return uri
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
            call_value = "%.2f" % round(call_value, 2)
        if isinstance(put_value, np.floating):
            put_value = "%.2f" % round(put_value, 2)
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
    fig, ax = plt.subplots(figsize=(22, 18))
    cf = ax.contourf(S, T, O, cmap=cmap)

    cbar = fig.colorbar(cf, ax=ax)
    cbar.set_label(f'{heatmap_type} Price', fontsize=35)
    cbar.ax.tick_params(labelsize=30)
    ax.set_title(f'{heatmap_type} Option Price Heatmap', fontsize=55)
    ax.set_xlabel('Spot Price', fontsize=35)
    ax.set_ylabel('Time to Maturity', fontsize=35)

    for i in range(S.shape[0] - 1):
        for j in range(S.shape[1] - 1):
            mid_x = (S[i, j] + S[i, j + 1]) / 2
            mid_y = (T[i, j] + T[i + 1, j]) / 2
            ax.text(mid_x, mid_y, f'{O[i, j]:.2f}', ha='center', va='center', color='black', fontsize=28, bbox=dict(facecolor='white', alpha=0.5, edgecolor='none'))

    ax.set_ylim(min_time, max_time)
    ax.set_yticks(np.around(np.linspace(min_time, max_time, num=10, endpoint=True), 2))
    ax.set_xlim(min_spot_price, max_spot_price)
    ax.set_xticks(np.around(np.linspace(min_spot_price, max_spot_price, num=10, endpoint=True), 2))
    ax.tick_params(axis='both', which='major', labelsize=30)

    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    string = base64.b64encode(buf.read())
    uri = urllib.parse.quote(string)
    plt.close(fig)
    return uri

def create_heatmap_data(min_spot_price, max_spot_price, min_time, max_time, K, r, sigma, num=8, y_axis='time', fixed_time=None, rfr_start=None):
    price = np.linspace(min_spot_price, max_spot_price, num=num, endpoint=True)

    if y_axis == 'time':
        y_vals = np.linspace(min_time, max_time, num=num, endpoint=True)
        S, Y = np.meshgrid(price, y_vals)
        C = np.zeros_like(S, dtype=float)
        P = np.zeros_like(S, dtype=float)

        for i in range(S.shape[0]):
            for j in range(S.shape[1]):
                T_val = Y[i, j]
                c_val, p_val = blackScholes(S[i, j], K, T_val, sigma, r)
                try:
                    C[i, j] = float(c_val)
                except Exception:
                    C[i, j] = float('nan')
                try:
                    P[i, j] = float(p_val)
                except Exception:
                    P[i, j] = float('nan')

    elif y_axis == 'rfr':
        high = r
        low = rfr_start if rfr_start is not None else 0.0

        if low >= high:
            raise ValueError(f"RFR Start ({low:.2f}) must be less than the sidebar RFR ({high:.2f}).")

        y_vals = np.linspace(low, high, num=num, endpoint=True)

        S, Y = np.meshgrid(price, y_vals)
        C = np.zeros_like(S, dtype=float)
        P = np.zeros_like(S, dtype=float)

        if fixed_time is None or fixed_time <= 0:
            raise ValueError("A positive fixed_time must be provided when y_axis is 'rfr'.")

        for i in range(S.shape[0]):
            for j in range(S.shape[1]):
                r_val = Y[i, j]
                c_val, p_val = blackScholes(S[i, j], K, fixed_time, sigma, r_val)
                try:
                    C[i, j] = float(c_val)
                except Exception:
                    C[i, j] = float('nan')
                try:
                    P[i, j] = float(p_val)
                except Exception:
                    P[i, j] = float('nan')

    else:
        raise ValueError(f'Unsupported y_axis: {y_axis}')

    return {
        'x': price.tolist(),
        'y': y_vals.tolist(),
        'call': C.tolist(),
        'put': P.tolist()
    }
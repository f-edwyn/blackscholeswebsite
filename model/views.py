import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from .valuation import blackScholes, create_heatmap, create_heatmap_data


class AssetPriceValidationView(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            value = float(data['value'])
            if value == 0:
                return JsonResponse({'value_error': 'Value cannot be 0.'})
            if value < 0:
                return JsonResponse({'value_error': 'Value cannot be a negative number'})
            return JsonResponse({'value_valid': True})
        except:
            return JsonResponse({'value_error': 'Value is invalid.'})

class ModelValuation(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            asset_price = float(data['assetPrice'])
            strike_price = float(data['strikePrice'])
            time = float(data['time'])
            volatility = float(data['volatility'])
            rfi_rate = float(data['rfiRate'])

            # The Black-Scholes formula requires time and volatility to be positive.
            if time <= 0:
                return JsonResponse({'calculation_error': 'Time to maturity must be a positive number.'})
            if volatility <= 0:
                return JsonResponse({'calculation_error': 'Volatility must be a positive number.'})
            if asset_price <= 0:
                return JsonResponse({'calculation_error': 'Asset price must be a positive number.'})
            if strike_price <= 0:
                return JsonResponse({'calculation_error': 'Strike price must be a positive number.'})

            call_value, put_value = blackScholes(asset_price, strike_price, time, volatility, rfi_rate)
            return JsonResponse({'call_value': call_value, 'put_value': put_value})
        except (ValueError, TypeError):
            return JsonResponse({'calculation_error': 'Invalid input. Please ensure all fields are valid numbers.'})
        except KeyError as e:
            return JsonResponse({'calculation_error': f'Missing required field: {e}.'})
        except Exception as e:
            return JsonResponse({'calculation_error': str(e)})

class HeatMap(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            # parse only expected numeric fields; ignore any extras like 'y_axis'
            strike_price = float(data.get('strikePrice', 100))
            rfi_rate = float(data.get('rfiRate', 0.01))
            volatility = float(data.get('volatility', 0.2))
            min_spot_price = float(data.get('minSpotPrice', 50))
            max_spot_price = float(data.get('maxSpotPrice', 150))
            heatmap_min_time = float(data.get('heatMapMinTime', 0.01))
            heatmap_max_time = float(data.get('heatMapMaxTime', 1.0))

            call_uri, put_uri = create_heatmap(min_spot_price, max_spot_price, heatmap_min_time, heatmap_max_time, strike_price, rfi_rate, volatility)
            return JsonResponse({'call_uri': call_uri, 'put_uri': put_uri})
        except Exception as e:
            return JsonResponse({'heatmap_error': str(e)})

class HeatMapData(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            min_spot_price = float(data.get('minSpotPrice', 50))
            max_spot_price = float(data.get('maxSpotPrice', 150))
            heatmap_min_time = float(data.get('heatMapMinTime', 0.01))
            heatmap_max_time = float(data.get('heatMapMaxTime', 1.0))
            strike_price = float(data.get('strikePrice', 100))
            rfi_rate = float(data.get('rfiRate', 0.01))
            volatility = float(data.get('volatility', 0.2))

            y_axis = data.get('y_axis', 'time')
            num = int(data.get('num', 40))
            
            rfr_start_str = data.get('rfr_start')
            rfr_start = None
            if rfr_start_str:
                try:
                    rfr_start = float(rfr_start_str)
                except (ValueError, TypeError):
                    return JsonResponse({'heatmap_error': 'RFR Start must be a valid number.'})

            if heatmap_min_time >= heatmap_max_time:
                return JsonResponse({'heatmap_error': 'Min time must be less than max time.'})
            if volatility <= 0:
                return JsonResponse({'heatmap_error': 'Volatility must be a positive number.'})

            if y_axis == 'time':
                fixed_time = None
            elif y_axis == 'rfr':
                fixed_time = heatmap_max_time
            else:
                return JsonResponse({'heatmap_error': f'Unsupported y_axis: {y_axis}'})

            payload = create_heatmap_data(
                min_spot_price, max_spot_price, heatmap_min_time, heatmap_max_time,
                strike_price, rfi_rate, volatility, num=num, y_axis=y_axis,
                fixed_time=fixed_time, rfr_start=rfr_start
            )
            return JsonResponse(payload)
        except (ValueError) as e:
            return JsonResponse({'heatmap_error': f'Invalid input: {str(e)}'})
        except Exception as e:
            return JsonResponse({'heatmap_error': str(e)})


def index(request):
    return render(request, 'model/index.html')

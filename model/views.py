import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from .valuation import blackScholes, create_heatmap

# Create your views here.

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
            data = {key: float(data[key]) for key in data}
            asset_price = data['assetPrice']
            strike_price = data['strikePrice']
            time = data['time']
            volatility = data['volatility']
            rfi_rate = data['rfiRate']
            call_value, put_value = blackScholes(asset_price, strike_price, time, volatility, rfi_rate)
            return JsonResponse({'call_value': call_value, 'put_value': put_value})
        except Exception as e:
            return JsonResponse({'calculation_error': e})

class HeatMap(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            data = {key: float(data[key]) for key in data}
            strike_price = data['strikePrice']
            rfi_rate = data['rfiRate']
            volatility = data['volatility']
            min_spot_price = data['minSpotPrice']
            max_spot_price = data['maxSpotPrice']
            heatmap_min_time = data['heatMapMinTime']
            heatmap_max_time = data['heatMapMaxTime']
            call_uri, put_uri = create_heatmap(min_spot_price, max_spot_price, heatmap_min_time, heatmap_max_time, strike_price, rfi_rate, volatility)
            return JsonResponse({'call_uri': call_uri, 'put_uri': put_uri})
        except Exception as e:
            return JsonResponse({'heatmap_error': e})

def index(request):
    return render(request, 'model/index.html')

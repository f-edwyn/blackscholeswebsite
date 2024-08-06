import json

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from .valuation import blackScholes

# Create your views here.

class AssetPriceValidationView(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            value = float(data['value'])
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

def index(request):
    return render(request, 'model/index.html')

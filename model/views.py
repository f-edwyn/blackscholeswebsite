import json

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse

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

def index(request):
    return render(request, 'model/index.html')

from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import AssetPriceValidationView, ModelValuation, HeatMap
from . import views

urlpatterns = [
    path('',views.index, name='model'),
    path('model/validate-value', csrf_exempt(AssetPriceValidationView.as_view()), name='validate_value'),
    path('model/perform-valuation', csrf_exempt(ModelValuation.as_view()), name='perform_valudation'),
    path('model/create-heatmap', csrf_exempt(HeatMap.as_view()), name='create_heatmap') # HeatMap
]
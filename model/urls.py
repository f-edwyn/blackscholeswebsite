from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import AssetPriceValidationView
from . import views

urlpatterns = [
    path('',views.index, name='model'),
    path('model/validate-value', csrf_exempt(AssetPriceValidationView.as_view()), name='validate_value')
]
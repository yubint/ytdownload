""" Importing path from django.urls to map urls to functions
    and view in order to get those functions"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('download', views.download)
]

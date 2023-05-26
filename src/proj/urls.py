from django.contrib import admin
from django.urls import path
from officesrates import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('map/', views.OfficeList.as_view()),
    path('map_byn/', views.offices_map_byn),
    path('pipeline/', views.pipeline),
    path('huff/', views.huff),
    path('vilnius/', views.vilnius_map),
    path('map_density/', views.offices_map_density),
    path('sidebar/', views.sidebar), 
    path('vacancy/', views.vacancy_map), 
    path('anchors/', views.anchors_map)
    ]




from django.shortcuts import render, HttpResponse, HttpResponseRedirect
from random import randint
from requests import post
from . import models 
from django.views.generic import ListView, TemplateView, DetailView, CreateView, DeleteView


def offices_map(request):
    template_name='officesrates/index.html' 
    return render(request, template_name, {})

def offices_map_byn(request):
    template_name='officesrates/index_byn.html' 
    return render(request, template_name, {})

def pipeline(request):
    template_name='officesrates/pipeline.html' 
    return render(request, template_name, {})

def vacancy_map(request):
    template_name='officesrates/vacancy.html' 
    return render(request, template_name, {})

def anchors_map(request):
    template_name='officesrates/anchors.html' 
    return render(request, template_name, {})

def vilnius_map(request):
    template_name='officesrates/vilnius.html' 
    return render(request, template_name, {})

def sidebar(request):
    template_name='officesrates/index1.html' 
    return render(request, template_name, {})

def huff(request):
    template_name='officesrates/huff.html' 
    return render(request, template_name, {})

def offices_map_density(request):
    template_name='officesrates/kepler.html' 
    return render(request, template_name, {})

class OfficeList(TemplateView):
    template_name='officesrates/index.html' 
    model=models.Office
    def get_queryset(self):
        qs=self.model.objects.all()
        return qs
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        return context
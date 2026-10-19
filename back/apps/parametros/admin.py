from django.contrib import admin
from .models import Parametros


@admin.register(Parametros)
class ParametrosAdmin(admin.ModelAdmin):
    list_display = ('aplica', 'codigo', 'nombre', 'valor', 'usado')
    list_filter = ('aplica',)
    search_fields = ('nombre', 'valor')

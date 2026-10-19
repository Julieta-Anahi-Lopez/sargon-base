from django.db import models


class Parametros(models.Model):
    """
    Tabla de parámetros de configuración compartida entre sistemas.
    Cada fila representa un valor configurable identificado por (aplica, codigo).

    Uso típico:
        get_parametro('Web', 1)           -> punto de venta para pedidos web
        get_parametro('Web', 2)           -> número de empresa
        get_parametro('Web', 3)           -> monto mínimo de pedido

    La columna `aplica` permite que una misma tabla sirva a distintos
    módulos o sistemas sin colisiones de códigos.
    """
    aplica = models.CharField(db_column='Aplica', max_length=50)
    codigo = models.IntegerField(db_column='Codigo', primary_key=True)
    nombre = models.CharField(db_column='Nombre', max_length=255, blank=True, null=True)
    valor = models.CharField(db_column='Valor', max_length=255, blank=True, null=True)
    usado = models.IntegerField(db_column='Usado', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parametros'
        unique_together = (('aplica', 'codigo'),)

    def __str__(self):
        return f"[{self.aplica}] {self.codigo}: {self.nombre} = {self.valor}"


def get_parametro(aplica: str, codigo: int, default=None):
    """
    Devuelve el valor (str) del parámetro identificado por (aplica, codigo).
    Si el registro no existe, retorna `default` en lugar de lanzar excepción.

    Ejemplo:
        punto_venta = get_parametro('Web', 1, default='9')
    """
    try:
        return Parametros.objects.get(aplica=aplica, codigo=codigo).valor
    except Parametros.DoesNotExist:
        return default

from django.db import models

# Create your models here.
class TipoRubros(models.Model):
    codigo = models.IntegerField(db_column='Codigo', primary_key=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=60, blank=True, null=True)  # Field name made lowercase.
    verweb = models.BooleanField(db_column='VerWeb', default=False)  # bit(1) en MySQL
    nrodep = models.CharField(db_column='NroDep', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tipo_rubros'
        ordering = ['nombre']



class TipoSubrubros(models.Model):
    nrorub = models.IntegerField(db_column='NroRub', primary_key=True)  # Field name made lowercase. The composite primary key (NroRub, Codigo) found, that is not supported. The first column is selected.
    codigo = models.IntegerField(db_column='Codigo')  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=60, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tipo_subrubros'
        unique_together = (('nrorub', 'codigo'),)
        ordering = ['nombre']
        
        
class TipoMarcas(models.Model):
    codigo = models.AutoField(db_column='Codigo', primary_key=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=60, blank=True, null=True)  # Field name made lowercase.
    verweb = models.BooleanField(db_column='VerWeb', default=False)  # bit(1) en MySQL

    class Meta:
        managed = False
        db_table = 'tipo_marcas'
        ordering = ['nombre']

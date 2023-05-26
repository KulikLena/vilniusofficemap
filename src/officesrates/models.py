from django.db import models

A= 'A'
B1= 'B1'
B2 = 'B2'
EXISTING ='Existing'
PIPELINE ='Pipeline'
JUST_COMPLETED ='Completed in 2022'

class Broker(models.Model):
    name = models.CharField(max_length=150)
    image = models.ImageField(upload_to='src/static/imagination', height_field=None, width_field=None, max_length=100, default= "img.jpeg")
    tel = models.CharField(max_length=150)
    
    def __str__(self) -> str:
        return self.name

class Office(models.Model):
     name = models.CharField(max_length=150)
     lat = models.DecimalField(verbose_name = "lat", blank=False, default=53.90253146975031, decimal_places=14, max_digits=100)
     lng = models.DecimalField(verbose_name = "lng", blank=False, default=27.561436808736307, decimal_places=14, max_digits=100)
     gla = models.DecimalField(verbose_name = "gla", blank=False, default=5000.00, decimal_places=2, max_digits=20)
     office_class = models.CharField(choices=[(A,'A'), (B1,'B1'),(B2,'B2') ], max_length=40, default='B1')
     rent = models.DecimalField(verbose_name = "rent", blank=False, default=1.00, decimal_places=2, max_digits=8)
     image = models.ImageField(upload_to='src/static/imagination', height_field=None, width_field=None, max_length=100, default= "img.jpeg")
     type = models.CharField(choices=[(EXISTING,'Existing'), (PIPELINE,'Pipeline'),(JUST_COMPLETED,'Completed in 2022') ], max_length=40, default='B1')
     broker = models.ForeignKey(Broker, on_delete=models.CASCADE)
     description = models.TextField(blank=True, null=True)

     def __str__(self) -> str:
         return self.name


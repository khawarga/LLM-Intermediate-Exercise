

from django.contrib import admin
from .models import LLMConfig, TestModel

# Register your models here
admin.site.register(LLMConfig)
admin.site.register(TestModel)

# llm_config/models.py
from django.db import models

LLM_Model_Choice = {
    "llama 3": "llama3",
    "gemma 3": "gemma3",
}


class LLMConfig(models.Model):
    name = models.CharField(max_length=100)
    prompt_template = models.TextField()
    model_name = models.CharField(
        max_length=50, choices=LLM_Model_Choice, default="llama 3")
    temperature = models.FloatField(default=0.7)
    language = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TestModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

from rest_framework import serializers
from llm_config.models import LLMConfig


class LLMConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMConfig
        fields = '__all__'

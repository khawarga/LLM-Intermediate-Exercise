from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import llm_configViewSet
from .views import Process_PDF, Chat_Request

router = DefaultRouter()
router.register(r'llm_config', llm_configViewSet)

urlpatterns = [
    path("process-pdf/", Process_PDF, name="process_pdf"),
    path("chat/", Chat_Request, name="chat_request"),

    path('edit-data/', include(router.urls)),
]

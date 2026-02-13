from django.urls import path
from .views import Process_PDF, Chat_Request

urlpatterns = [
    path("process-pdf/", Process_PDF, name="process_pdf"),
    path("chat/", Chat_Request, name="chat_request"),

]

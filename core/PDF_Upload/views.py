import uuid
import os
import tempfile
import json
import requests
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from llm_config.models import LLMConfig
from .serializers import LLMConfigSerializer
from rest_framework import viewsets

embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="docs")


@csrf_exempt
def Process_PDF(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST required"}, status=405)

    if "file" not in request.FILES:
        return JsonResponse({"status": "error", "message": "No file uploaded"}, status=400)

    pdf_file = request.FILES["file"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        for c in pdf_file.chunks():
            tmp.write(c)
        tmp_path = tmp.name

    reader = PdfReader(tmp_path)
    text = "".join(page.extract_text() or "" for page in reader.pages)

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    embeddings = embedding_model.encode(chunks)
    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),
        ids=ids,
        metadatas=[{"source": pdf_file.name}] * len(chunks)
    )

    os.unlink(tmp_path)

    return JsonResponse({
        "status": "success",
        "file": pdf_file.name,
        "chunks": len(chunks)
    }, status=201)


@csrf_exempt
def Chat_Request(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "POST request required"}, status=400)

    try:
        body = json.loads(request.body)
        question = body.get("question")
        model = body.get("model", "llama3")

        if not question:
            return JsonResponse({"status": "error", "message": "Question is required"}, status=400)

        query_embedding = embedding_model.encode(question).tolist()

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3
        )

        context_docs = results["documents"][0]

        if not context_docs:
            return JsonResponse({
                "status": "error",
                "message": "No relevant documents found"
            }, status=404)

        context = "\n\n".join(context_docs)

        prompt = f"""
        Answer the question based ONLY on the context below.

        Context:
        {context}

        Question:
        {question}

        Answer:
        """

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }
        )

        data = response.json()
        print("OLLAMA RAW:", data)

        if "response" in data:
            answer = data["response"]
        elif "message" in data and "content" in data["message"]:
            answer = data["message"]["content"]
        else:
            answer = "No response"

        return JsonResponse({
            "status": "success",
            "question": question,
            "answer": answer
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)
   

class llm_configViewSet(viewsets.ModelViewSet):
    queryset = LLMConfig.objects.all()
    serializer_class = LLMConfigSerializer

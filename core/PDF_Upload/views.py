import uuid
import os
import tempfile
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from sentence_transformers import SentenceTransformer
import chromadb
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
client = chromadb.Client()
collection = client.get_or_create_collection(name="docs")


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

    embeddings = model.encode(chunks)
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

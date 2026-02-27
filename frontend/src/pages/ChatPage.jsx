import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadMsg, setUploadMsg] = useState("");
    const [uploading, setUploading] = useState(false);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [chatMsg, setChatMsg] = useState("");
    const [chatting, setChatting] = useState(false);

    // Model selection (simple dropdown)
    const [model, setModel] = useState("llama3");

    // Optional: load configs from API (if you want to use later)
    const [configs, setConfigs] = useState([]);

    useEffect(() => {
        // Optional: fetch llm_config list (won't break if empty)
        axios
            .get(`${API_BASE}/PDF_Upload/edit-data/llm_config/`)
            .then((res) => setConfigs(res.data))
            .catch(() => { });
    }, []);

    const uploadPdf = async () => {
        setUploadMsg("");
        if (!pdfFile) {
            setUploadMsg("Please choose a PDF first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", pdfFile);

        try {
            setUploading(true);
            const res = await axios.post(
                `${API_BASE}/PDF_Upload/process-pdf/`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setUploadMsg(`✅ Uploaded: ${res.data.file} | Chunks: ${res.data.chunks}`);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Upload failed.";
            setUploadMsg(`❌ ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    const sendChat = async () => {
        setChatMsg("");
        setAnswer("");

        if (!question.trim()) {
            setChatMsg("Please type a question.");
            return;
        }

        try {
            setChatting(true);
            const res = await axios.post(`${API_BASE}/PDF_Upload/chat/`, {
                question,
                model, // <— this matches your Django view: body.get("model", "llama3")
            });

            setAnswer(res.data.answer);
            setChatMsg("✅ Answer received");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Chat failed.";
            setChatMsg(`❌ ${msg}`);
        } finally {
            setChatting(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
            <h2>PDF Upload + Chat (Django + Chroma + Ollama)</h2>

            {/* Upload PDF */}
            <div style={{ padding: 20, border: "1px solid #333", borderRadius: 10, marginBottom: 20 }}>
                <h3>1) Upload PDF</h3>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                <button
                    onClick={uploadPdf}
                    disabled={uploading}
                    style={{ marginLeft: 10 }}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>

                <div style={{ marginTop: 10 }}>{uploadMsg}</div>
            </div>

            {/* Model picker */}
            <div style={{ padding: 20, border: "1px solid #333", borderRadius: 10, marginBottom: 20 }}>
                <h3>2) Choose Model</h3>

                {/* simple hardcoded models (best for now) */}
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="llama3">llama3</option>
                    <option value="gemma:2b">gemma:2b</option>
                </select>

                {/* optional: show configs fetched from DB */}
                {configs?.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                        Configs in DB: {configs.length}
                    </div>
                )}
            </div>

            {/* Chat */}
            <div style={{ padding: 20, border: "1px solid #333", borderRadius: 10 }}>
                <h3>3) Ask Question</h3>

                <textarea
                    rows={4}
                    style={{ width: "100%", padding: 10 }}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask something based on the uploaded PDF..."
                />

                <button onClick={sendChat} disabled={chatting} style={{ marginTop: 10 }}>
                    {chatting ? "Asking..." : "Ask"}
                </button>

                <div style={{ marginTop: 10 }}>{chatMsg}</div>

                {answer && (
                    <div style={{ marginTop: 15, padding: 12, background: "#111", borderRadius: 8 }}>
                        <strong>Answer:</strong>
                        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{answer}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
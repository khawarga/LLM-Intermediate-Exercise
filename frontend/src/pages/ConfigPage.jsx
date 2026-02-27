import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/PDF_Upload/edit-data/llm_config/";

function App() {
    const [editingId, setEditingId] = useState(null);
    const [configs, setConfigs] = useState([]);

    const [form, setForm] = useState({
        name: "",
        prompt_template: "",
        model_name: "llama 3",
        temperature: 0.7,
        language: "",
    });

    const fetchData = async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        setConfigs(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: name === "temperature" ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editingId ? "PATCH" : "POST";
        const url = editingId ? `${API_URL}${editingId}/` : API_URL;

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        console.log("SERVER RESPONSE:", data);

        setForm({
            name: "",
            prompt_template: "",
            model_name: "llama 3",
            temperature: 0.7,
            language: "",
        });

        setEditingId(null);
        fetchData();
    };

    const handleEdit = (item) => {
        setForm({
            name: item.name,
            prompt_template: item.prompt_template,
            model_name: item.model_name,
            temperature: item.temperature,
            language: item.language,
        });

        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        await fetch(`${API_URL}${id}/`, {
            method: "DELETE",
        });

        fetchData();
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>LLM Config Manager</h2>

            <form onSubmit={handleSubmit}>
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                />

                <br /><br />

                <textarea
                    name="prompt_template"
                    placeholder="Prompt Template"
                    value={form.prompt_template}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="model_name"
                    value={form.model_name}
                    onChange={handleChange}
                >
                    <option value="llama3">llama 3</option>
                    <option value="gemma3">gemma 3</option>
                </select>

                <br /><br />

                <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    placeholder="Temperature"
                    value={form.temperature}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="language"
                    placeholder="Language"
                    value={form.language}
                    onChange={handleChange}
                />
                <br></br>
                <br></br>
                <button type="submit">
                    {editingId ? "Update Config" : "Add Config"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setForm({
                                name: "",
                                prompt_template: "",
                                model_name: "llama3",
                                temperature: 0.7,
                                language: "",
                            });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>
            <br></br>
            <hr />

            <h2>All Available LLM Configs</h2>

            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Prompt Template</th>
                        <th>Model</th>
                        <th>Temperature</th>
                        <th>Language</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {configs.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.prompt_template}</td>
                            <td>{item.model_name}</td>
                            <td>{item.temperature}</td>
                            <td>{item.language}</td>
                            <td>
                                <button onClick={() => handleEdit(item)}>
                                    Edit
                                </button>
                                <span>  </span>
                                <button onClick={() => handleDelete(item.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
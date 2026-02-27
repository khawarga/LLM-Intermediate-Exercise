import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ConfigPage from "./pages/ConfigPage";
import ChatPage from "./pages/ChatPage";

function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center"
      }}
    >
      <h2>Hello</h2>
      <p>Select a page:</p>

      <div style={{ margin: "10px" }}>
        <Link to="/configs">Go to Config Page</Link>
      </div>

      <div style={{ margin: "10px" }}>
        <Link to="/chat">Go to Chat Page</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configs" element={<ConfigPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AIAssistantPage } from './ui/pages/P33-AI助手页';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/" element={
          <main className="container">
            <h1>Welcome to Tauri + React</h1>
          </main>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
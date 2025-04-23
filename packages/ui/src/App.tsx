import { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    setText('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setText(data.text || '❗ Текст не извлечён');
    } catch (err) {
      setText('❌ Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Flowise NSBU – Загрузка PDF</h1>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleUpload} disabled={!selectedFile || loading} style={{ marginLeft: '1rem' }}>
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>
      <hr />
      <div style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'scroll', marginTop: '1rem' }}>
        {text}
      </div>
    </div>
  );
}

export default App;
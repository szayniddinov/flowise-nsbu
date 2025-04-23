import React, { useState } from 'react'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>('')

  const handleUpload = async () => {
    if (!file) return alert('Выберите PDF файл')
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/upload-pdf', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setResult(data.text || data.preview || 'Текст не найден')
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Flowise NSBU – Загрузка PDF</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} style={{ marginLeft: 12 }}>
        Загрузить
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Результат:</h3>
          <pre style={{ background: '#f0f0f0', padding: 16 }}>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default App

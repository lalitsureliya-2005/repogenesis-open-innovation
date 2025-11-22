import React, { useState } from 'react'
import axios from 'axios'
import './App.css'
import logo from './logo.png'

export default function App() {
  const [errorMessage, setErrorMessage] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [stackTrace, setStackTrace] = useState('')
  const [variant, setVariant] = useState('')
  const [zipFile, setZipFile] = useState(null)
  const [downUrl, setDownUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setErr(''); setDownUrl('')
    try {
      const fd = new FormData()
      fd.append('errorMessage', errorMessage)
      fd.append('codeSnippet', codeSnippet)
      fd.append('stackTrace', stackTrace)
      fd.append('variant', variant)
      if (zipFile) fd.append('projectZip', zipFile)

      const resp = await axios.post('http://localhost:5000/api/generate', fd, {
        responseType: 'blob'
      })
      const blob = new Blob([resp.data], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      setDownUrl(url)
    } catch(ex){
      setErr(ex?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '24px', marginTop: '8px', marginBottom: '20px' }}>
        <img src={logo} alt="BUG FORGE Logo" style={{ width: '150px', height: '150px', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 4px 0' }}>BUG &lt;/FORGE&gt;</h1>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.15em', color: '#a855f7', textTransform: 'uppercase' }}>WHERE BUGS GET BEATEN</p>
          <p style={{ margin: 0 }}>Upload your project (optional), paste the error and snippet. Receive a ZIP that reproduces the bug.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ margin: '12px 0' }}>
          <label>Error Message</label><br/>
          <textarea rows={3} value={errorMessage} onChange={e=>setErrorMessage(e.target.value)} style={{width:'100%'}} required />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Code Snippet</label><br/>
          <textarea rows={6} value={codeSnippet} onChange={e=>setCodeSnippet(e.target.value)} style={{width:'100%'}} placeholder="// paste the smallest code that shows the error" />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Stack Trace (optional)</label><br/>
          <textarea rows={6} value={stackTrace} onChange={e=>setStackTrace(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Variant (optional)</label><br/>
          <select value={variant} onChange={e=>setVariant(e.target.value)}>
            <option value="">Auto</option>
            <option value="Variant A: Pure Node.js">Variant A: Pure Node.js</option>
            <option value="Variant B: React-only">Variant B: React-only</option>
            <option value="Variant C: Backend + frontend pair">Variant C: Backend + frontend pair</option>
          </select>
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Project ZIP (optional)</label><br/>
          <input type="file" accept=".zip" onChange={e=>setZipFile(e.target.files?.[0] || null)} />
        </div>
        <button disabled={loading} type="submit">{loading ? 'Generating…' : 'Generate MRE ZIP'}</button>
      </form>

      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      {downUrl && (
        <p>
          <a href={downUrl} download="mre.zip">Download MRE ZIP</a>
        </p>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react';
import { type AppConfig, loadConfig } from './config';

interface ExtractedField {
  key: string;
  value: string;
}

const MOCK_RESPONSE: ExtractedField[] = [
  { key: 'Vendor', value: 'Acme Solutions Ltd' },
  { key: 'Invoice Number', value: 'INV-2024-0847' },
  { key: 'Date', value: '2024-05-03' },
  { key: 'Due Date', value: '2024-06-02' },
  { key: 'Amount', value: '£4,250.00' },
  { key: 'Tax (VAT 20%)', value: '£850.00' },
  { key: 'Total', value: '£5,100.00' },
  { key: 'Status', value: 'Unpaid' },
  { key: 'Payment Terms', value: 'Net 30' },
];

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ExtractedField[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadConfig().then(setConfig); }, []);
  if (!config) return null;

  async function extract() {
    setLoading(true);
    setResult(null);
    try {
      if (config!.deploymentId === 'local') {
        await new Promise((r) => setTimeout(r, 1500));
        setResult(MOCK_RESPONSE);
      } else {
        const res = await fetch(
          `https://app.jobgraph.com/api/apps/${config!.deploymentId}/process`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, type: 'process' }) }
        );
        const data = await res.json();
        setResult(data.fields);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function copy() {
    if (!result) return;
    const text = result.map(f => `${f.key}: ${f.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        {config.logoUrl && <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />}
        <h1 className="text-xl font-semibold">{config.appName}</h1>
        <span className="text-sm text-white/50">{config.orgName}</span>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a document, email, or form content here..."
          className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={extract} disabled={loading || !input.trim()} style={{ backgroundColor: config.brandColour }} className="px-6 py-2.5 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          {loading ? 'Extracting...' : 'Extract data'}
        </button>
        {result && (
          <div className="space-y-4 pt-4">
            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-3">Extracted Fields</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/50 border-b border-white/10">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((f, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 text-white/60 font-medium">{f.key}</td>
                      <td className="py-2 text-white/80">{f.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <button onClick={copy} className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors">
              {copied ? '✓ Copied!' : 'Copy extracted data'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

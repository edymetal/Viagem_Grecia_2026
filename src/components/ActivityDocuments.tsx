import { useEffect, useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { activityPdfs, matchesPdfRule, type TripPdfRule } from '../data/activityPdfs';
import type { Activity } from '../data/schema';
import { canPickPdfFolder, listFolderPdfs, loadPdfFolder, openFolderPdf, pickPdfFolder, rememberPdfFolder, type FolderPdf, type PdfDirectory } from '../lib/pdfFolder';

export function ActivityDocuments({ activity }: { activity: Activity }) {
  const rules = activityPdfs(activity);
  const supported = canPickPdfFolder();
  const [folder, setFolder] = useState<PdfDirectory>();
  const [pdfs, setPdfs] = useState<FolderPdf[]>([]);
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<{ label: string; name: string; url: string }>();
  useEffect(() => {
    if (!supported || !rules.length) return;
    let active = true;
    setScanned(false);
    void (async () => {
      try {
        const saved = await loadPdfFolder();
        if (!saved || !active) return;
        setFolder(saved);
        const permission = await saved.queryPermission?.({ mode: 'read' });
        if (permission && permission !== 'granted') return;
        const files = await listFolderPdfs(saved);
        if (active) { setPdfs(files); setScanned(true); }
      } catch { if (active) setMessage('Escolha a pasta Viagem novamente para acessar os documentos.'); }
    })();
    return () => { active = false; };
  }, [activity.id, supported]);
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.url); }, [selected]);
  if (!rules.length) return null;
  async function connect() {
    setMessage('');
    try {
      let directory = folder;
      if (directory?.requestPermission) {
        if (await directory.requestPermission({ mode: 'read' }) !== 'granted') {
          setMessage('Permita a leitura da pasta para abrir os documentos.'); return;
        }
      } else directory = await pickPdfFolder();
      if (!directory) return;
      const files = await listFolderPdfs(directory);
      setFolder(directory); setPdfs(files); setScanned(true);
      try { await rememberPdfFolder(directory); } catch { setMessage('A pasta está disponível apenas nesta sessão.'); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('Não foi possível acessar a pasta. Confira a permissão e tente novamente.');
    }
  }
  async function open(pdf: FolderPdf) {
    try { setMessage(''); await openFolderPdf(pdf); }
    catch { setMessage('Não foi possível abrir o PDF. Autorize a pasta novamente ou confira se o arquivo ainda está no local.'); }
  }
  function selectFile(file: File | undefined, rule: TripPdfRule) {
    setSelected(undefined); setMessage('');
    if (!file) return;
    if (!matchesPdfRule(file.name, rule)) {
      setMessage('O nome do arquivo escolhido não corresponde a esta opção. Confira o PDF selecionado.'); return;
    }
    setSelected({ label: rule.label, name: file.name, url: URL.createObjectURL(file) });
  }
  return <section className="card detail-section activity-documents" aria-label="Documentos desta atividade">
    <h3>Documentos desta atividade</h3>
    {supported ? <><p className="small muted">Os nomes e arquivos são lidos da pasta Viagem deste dispositivo.</p><button className="button secondary" onClick={() => void connect()}><FolderOpen size={17} /> {folder ? 'Autorizar acesso à pasta' : 'Escolher pasta Viagem'}</button></> : <p className="small muted">Neste navegador, selecione o arquivo em Documents / Viagem. O acesso automático à pasta não está disponível.</p>}
    {rules.map(rule => {
      const matches = pdfs.filter(pdf => matchesPdfRule(pdf.path, rule));
      return <div key={rule.label} className="activity-document-item">
        <strong>{rule.label}</strong>
        {supported ? matches.length ? matches.map(pdf => <button key={pdf.path} className="button secondary" onClick={() => void open(pdf)}><FileText size={17} /> Abrir {pdf.path}</button>) : <span className="small muted">{scanned ? 'Nenhum PDF correspondente encontrado na pasta.' : 'Autorize ou escolha a pasta para procurar o documento.'}</span> : <>
          <label className="button secondary"><FolderOpen size={17} /> Selecionar arquivo<input className="activity-pdf-input" type="file" accept="application/pdf,.pdf" aria-label={`Selecionar ${rule.label}`} onChange={event => { selectFile(event.currentTarget.files?.[0], rule); event.currentTarget.value = ''; }} /></label>
          {selected?.label === rule.label && <><small>{selected.name}</small><a className="button" href={selected.url} target="_blank" rel="noopener noreferrer"><FileText size={17} /> Abrir PDF selecionado</a></>}
        </>}
      </div>;
    })}
    {message && <p className="error-box" role="status">{message}</p>}
  </section>;
}

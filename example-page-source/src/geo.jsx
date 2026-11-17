import React, { useMemo, useState } from 'react';
import { Button, SearchField, Input, Checkbox, FileTrigger } from 'react-aria-components';
import { Plus, Pencil, Trash2, Upload, Download, Check } from 'lucide-react';
import { DButton } from './ui.jsx';
import { Tooltip, FileUpload, MessageBanner } from '../lib/index';
import { Dlg, Field, SelectField, TreeList, allIds, filterTree } from './kit.jsx';

/* Sample data: Haiti, departments, some arrondissements and communes. name is shown in the interface language. */
const D = (id, en, fr, nationalId, children, extra) => ({ id, name: en, names: { en, fr }, nationalId, children, ...extra });
const START = [
  D('HT', 'Haiti', 'Haïti', 'HT', [
    D('HT01', 'Ouest', 'Ouest', 'HT01', [
      D('HT011', 'Port-au-Prince', 'Port-au-Prince', 'HT011', [
        D('HT0111', 'Port-au-Prince', 'Port-au-Prince', 'HT0111', undefined, { linked: true, geometry: true }),
        D('HT0112', 'Delmas', 'Delmas', 'HT0112', undefined, { linked: true, geometry: true }),
        D('HT0113', 'Carrefour', 'Carrefour', 'HT0113', undefined, { geometry: true }),
        D('HT0114', 'Pétion-Ville', 'Pétion-Ville', 'HT0114', undefined, { geometry: true }),
        D('HT0115', 'Kenscoff', 'Kenscoff', 'HT0115'),
      ], { geometry: true }),
      D('HT012', 'Léogâne', 'Léogâne', 'HT012', [D('HT0121', 'Léogâne', 'Léogâne', 'HT0121', undefined, { linked: true }), D('HT0122', 'Petit-Goâve', 'Petit-Goâve', 'HT0122'), D('HT0123', 'Grand-Goâve', 'Grand-Goâve', 'HT0123')]),
      D('HT013', 'Croix-des-Bouquets', 'Croix-des-Bouquets', 'HT013'),
    ], { geometry: true }),
    D('HT02', 'South-East', 'Sud-Est', 'HT02', [D('HT021', 'Jacmel', 'Jacmel', 'HT021'), D('HT022', 'Bainet', 'Bainet', 'HT022'), D('HT023', 'Belle-Anse', 'Belle-Anse', 'HT023')], { geometry: true }),
    D('HT03', 'North', 'Nord', 'HT03', [D('HT031', 'Cap-Haïtien', 'Cap-Haïtien', 'HT031', [D('HT0311', 'Cap-Haïtien', 'Cap-Haïtien', 'HT0311'), D('HT0312', 'Quartier-Morin', 'Quartier-Morin', 'HT0312'), D('HT0313', 'Limonade', 'Limonade', 'HT0313')]), D('HT032', 'Acul-du-Nord', 'Acul-du-Nord', 'HT032')], { geometry: true }),
    D('HT04', 'North-East', 'Nord-Est', 'HT04', undefined, { geometry: true }),
    D('HT05', 'Artibonite', 'Artibonite', 'HT05', [D('HT051', 'Gonaïves', 'Gonaïves', 'HT051'), D('HT052', 'Saint-Marc', 'Saint-Marc', 'HT052'), D('HT053', 'Dessalines', 'Dessalines', 'HT053')], { geometry: true }),
    D('HT06', 'Centre', 'Centre', 'HT06', undefined, { geometry: true }),
    D('HT07', 'South', 'Sud', 'HT07', [D('HT071', 'Les Cayes', 'Les Cayes', 'HT071', undefined, { linked: true }), D('HT072', 'Port-Salut', 'Port-Salut', 'HT072')], { geometry: true }),
    D('HT08', 'Grand\'Anse', 'Grand\'Anse', 'HT08', [D('HT081', 'Jérémie', 'Jérémie', 'HT081', undefined, { linked: true })], { geometry: true }),
    D('HT09', 'North-West', 'Nord-Ouest', 'HT09', undefined, { geometry: true }),
    D('HT10', 'Nippes', 'Nippes', 'HT10', undefined, { geometry: true }),
  ], { geometry: true, country: true }),
];
const count = (ns) => ns.reduce((t, x) => t + 1 + count(x.children || []), 0);
const find = (ns, id) => { for (const n of ns) { if (n.id === id) return n; const c = n.children && find(n.children, id); if (c) return c; } return null; };
const parentOf = (ns, id, parent = null) => { for (const n of ns) { if (n.id === id) return parent; const c = n.children && parentOf(n.children, id, n); if (c !== undefined) return c; } return undefined; };
const flat = (ns, depth = 0, skip, out = []) => { ns.forEach((n) => { if (n.id === skip) return; out.push({ id: n.id, label: n.name, depth }); flat(n.children || [], depth + 1, skip, out); }); return out; };
const map = (ns, fn) => ns.map((n) => fn({ ...n, children: n.children ? map(n.children, fn) : undefined }));
const remove = (ns, id) => ns.filter((n) => n.id !== id).map((n) => ({ ...n, children: n.children ? remove(n.children, id) : undefined }));
const insert = (ns, parentId, node) => (parentId === 'none' ? [...ns, node] : map(ns, (n) => (n.id === parentId ? { ...n, children: [...(n.children || []), node] } : n)));

/* Prototype stand-in for the map: draws an outline so the preview has a place in the layout. The real one shows the uploaded boundary on a map. */
function BoundaryPreview({ id, name }) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  const pts = Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2; const r = 44 + ((h * (i + 3) * 7) % 22); return `${(160 + Math.cos(a) * r * 1.9).toFixed(1)},${(70 + Math.sin(a) * r * 0.95).toFixed(1)}`; }).join(' ');
  return (
    <svg viewBox="0 0 320 140" role="img" aria-label={`Boundary of ${name} on a map`} className="block h-[140px] w-full rounded-lg border border-border bg-inset">
      <polygon points={pts} fill="var(--accent-100)" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function DivisionDialog({ tree, item, parentId, onClose, onSave }) {
  const [f, setF] = useState({ parent: item ? (parentOf(tree, item.id)?.id ?? 'none') : (parentId ?? 'none'), en: item?.names.en ?? '', fr: item?.names.fr ?? '', nationalId: item?.nationalId ?? '', geometry: !!item?.geometry, file: null, country: !!item?.country });
  const [err, setErr] = useState({});
  const set = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: undefined })); };
  const parents = [{ id: 'none', label: 'None (top level)' }, ...flat(tree, 0, item?.id)];
  return (
    <Dlg wide title={item ? 'Edit division' : 'Add division'} onClose={onClose} submitLabel={item ? 'Save changes' : 'Add division'}
      onSubmit={() => {
        const e = {};
        if (!f.en.trim()) e.en = 'Enter the name in English.';
        if (!f.nationalId.trim()) e.nationalId = 'Enter the national ID.';
        else if (flat(tree).some((x) => x.id !== item?.id && find(tree, x.id).nationalId === f.nationalId.trim())) e.nationalId = 'Another division already uses this ID.';
        setErr(e);
        if (!Object.keys(e).length) onSave(f);
      }}>
      <SelectField label="Belongs to" items={parents} value={f.parent} onChange={set('parent')} help="The division one level up." />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Name (English)" value={f.en} onChange={set('en')} error={err.en} />
        <Field label="Name (French)" optional value={f.fr} onChange={set('fr')} />
      </div>
      <Field label="National ID" value={f.nationalId} onChange={set('nationalId')} error={err.nationalId} help="The code your country uses for this division, for example HT0112." />
      <div className="field">
        <span className="field-label">Boundary <span className="font-normal text-fg-2">(optional)</span></span>
        {item?.geometry && !f.file && <BoundaryPreview id={item.id} name={item.name} />}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-fg">{f.file ? f.file : f.geometry ? 'Boundary file uploaded' : 'No boundary file'}</span>
          <FileTrigger acceptedFileTypes={['.geojson', '.json']} onSelect={(fl) => { if (fl && fl[0]) setF((x) => ({ ...x, file: fl[0].name, geometry: true })); }}>
            <DButton variant="secondary"><Upload className="i" aria-hidden="true" />{f.geometry ? 'Replace file' : 'Upload file'}</DButton>
          </FileTrigger>
          {item?.geometry && !f.file && <DButton variant="ghost"><Download className="i" aria-hidden="true" />Download</DButton>}
        </div>
        <span className="field-help">A GeoJSON file with the outline of this division. It is used to show the division on maps.</span>
      </div>
      {item && tree.length === 1 && tree[0].id === item.id && f.parent === 'none' && (
        <div className="field">
          <Checkbox className="check" isSelected={f.country} onChange={set('country')}><span className="box"><Check className="i" aria-hidden="true" /></span>This is the whole country (level 0)</Checkbox>
          <span className="field-help">Its boundary is used as the country outline. The divisions inside it start at level 1.</span>
        </div>
      )}
    </Dlg>
  );
}

function UploadDialog({ onClose, onDone }) {
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(false);
  if (result) return (
    <Dlg wide title="Upload finished" onClose={onClose}>
      <MessageBanner tone="warning" title="142 divisions imported, 2 failed">Fix the rows below in your file and upload it again. Divisions that were imported are not added twice.</MessageBanner>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="dtable dtable-static" style={{ minWidth: 0 }}>
          <thead><tr><th className="t-th" scope="col">ID in file</th><th className="t-th" scope="col">Problem</th></tr></thead>
          <tbody>
            <tr><td className="tnum">HT0634</td><td style={{ whiteSpace: 'normal' }}>The parent HT063 is not in the file.</td></tr>
            <tr><td className="tnum">HT0915</td><td style={{ whiteSpace: 'normal' }}>The boundary file HT0915.geojson is missing from the ZIP.</td></tr>
          </tbody>
        </table>
      </div>
    </Dlg>
  );
  return (
    <Dlg wide title="Upload divisions" onClose={onClose} submitLabel="Upload and import"
      onSubmit={() => { if (!files.length) { setErr('Choose a ZIP file to upload.'); return; } setResult(true); onDone(); }}>
      <p>Upload one ZIP file with a CSV list of your divisions and a GeoJSON boundary file for each one. Existing divisions with the same ID are updated.</p>
      <div className="flex flex-col gap-2">
        <FileUpload hint="One ZIP file, up to 200 MB" onFiles={(fl) => { setFiles(fl.slice(0, 1)); setErr(''); }} />
        {files.length > 0 && <p className="text-fg" role="status">Selected file: {files[0].name}</p>}
        {err && <p className="field-error" role="alert">{err}</p>}
      </div>
      <div><DButton variant="ghost"><Download className="i" aria-hidden="true" />Download an example ZIP</DButton></div>
    </Dlg>
  );
}

export function GeoView({ notify }) {
  const [tree, setTree] = useState(START);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(new Set(['HT', 'HT01']));
  const [dlg, setDlg] = useState(null); // { kind: 'add' | 'edit' | 'delete' | 'upload', item, parentId }
  const nodes = useMemo(() => filterTree(tree, q), [tree, q]);
  const expanded = q.trim() ? new Set(allIds(nodes)) : open;
  const total = count(nodes);
  const hasCountry = tree.length === 1 && !!tree[0].country;
  const levelLabel = (level) => (hasCountry ? (level === 1 ? 'Country' : `Level ${level - 1}`) : `Level ${level}`);
  const close = () => setDlg(null);
  const kids = dlg?.kind === 'delete' ? count(dlg.item.children || []) : 0;

  const save = (f) => {
    const names = { en: f.en.trim(), fr: f.fr.trim() };
    if (dlg.kind === 'add') {
      const node = { id: `n${Date.now()}`, name: names.en, names, nationalId: f.nationalId.trim(), geometry: f.geometry };
      setTree((t) => insert(t, f.parent, node));
      if (f.parent !== 'none') setOpen((o) => new Set([...o, f.parent, ...(function up(id, acc = []) { const p = parentOf(tree, id); return p ? up(p.id, [...acc, p.id]) : acc; })(f.parent)]));
      notify(`${names.en} was added.`);
    } else {
      const old = parentOf(tree, dlg.item.id)?.id ?? 'none';
      const node = { ...dlg.item, name: names.en, names, nationalId: f.nationalId.trim(), geometry: f.geometry, country: f.country };
      setTree((t) => (old === f.parent ? map(t, (n) => (n.id === node.id ? { ...node, children: n.children } : n)) : insert(remove(t, node.id), f.parent, node)));
      if (old !== f.parent && f.parent !== 'none') setOpen((o) => new Set([...o, f.parent]));
      notify(old === f.parent ? 'Changes saved.' : `${names.en} was moved.`);
    }
    close();
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
        <div className="min-w-0 max-w-[640px] flex-1 basis-[320px]">
          <h1 className="t-page-title">Geographic levels</h1>
          <p className="mt-1 text-fg-2">The administrative divisions of the country, used to say where an event happened.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DButton variant="secondary" onPress={() => setDlg({ kind: 'upload' })}><Upload className="i" aria-hidden="true" />Upload ZIP</DButton>
          <DButton variant="secondary" onPress={() => notify(`${count(tree)} divisions exported to CSV.`)}><Download className="i" aria-hidden="true" />Export CSV</DButton>
          <DButton variant="primary" onPress={() => setDlg({ kind: 'add' })}><Plus className="i" aria-hidden="true" />Add division</DButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4">
        <SearchField style={{ width: 340, maxWidth: '100%' }} aria-label="Search divisions" value={q} onChange={setQ}>
          <Input className="input w-full" placeholder="Search divisions" />
        </SearchField>
        <span className="ml-auto flex gap-2">
          <DButton variant="ghost" isDisabled={!!q.trim()} onPress={() => setOpen(new Set(allIds(tree)))}>Expand all</DButton>
          <DButton variant="ghost" isDisabled={!!q.trim()} onPress={() => setOpen(new Set())}>Collapse all</DButton>
        </span>
      </div>

      <section className="card overflow-hidden" aria-label="Divisions">
        <div className="tl-head" aria-hidden="true">
          <span className="min-w-0 flex-1">Name</span>
          <span className="tl-col hidden w-[96px] md:block">Level</span>
          <span className="tl-col hidden w-[120px] md:block">National ID</span>
          <span className="tl-col hidden w-[96px] lg:block">Boundary</span>
          <span className="w-[104px] flex-none" />
        </div>
        <TreeList label="Divisions" nodes={nodes} expanded={expanded} onExpandedChange={(k) => { if (!q.trim()) setOpen(new Set(k)); }}
          empty={q.trim() ? `No divisions match "${q}".` : 'No divisions yet. Upload a ZIP file with your divisions, or add them one by one.'}
          renderMain={(d, level) => (
            <>
              <span className="min-w-0 flex-1 truncate text-fg" title={d.name}>{d.name}</span>
              <span className="tl-col hidden w-[96px] md:block">{levelLabel(level)}</span>
              <span className="tl-col hidden w-[120px] md:block" style={{ fontFamily: 'var(--font-mono)' }}>{d.nationalId || '-'}</span>
              <span className="tl-col hidden w-[96px] lg:block">{d.geometry ? <span className="inline-flex items-center gap-1"><Check className="i" aria-hidden="true" />Uploaded</span> : 'None'}</span>
            </>
          )}
          renderActions={(d) => (
            <>
              <Tooltip text="Add a division inside"><Button className="icon-btn" aria-label={`Add a division inside ${d.name}`} onPress={() => setDlg({ kind: 'add', parentId: d.id })}><Plus className="i" aria-hidden="true" /></Button></Tooltip>
              <Tooltip text="Edit division"><Button className="icon-btn" aria-label={`Edit ${d.name}`} onPress={() => setDlg({ kind: 'edit', item: d })}><Pencil className="i" aria-hidden="true" /></Button></Tooltip>
              <Tooltip text="Delete division"><Button className="icon-btn" aria-label={`Delete ${d.name}`} onPress={() => setDlg({ kind: 'delete', item: d })}><Trash2 className="i" aria-hidden="true" /></Button></Tooltip>
            </>
          )} />
        <div className="border-t border-border px-4 py-3 text-fg-2">{total} {total === 1 ? 'division' : 'divisions'}{q.trim() ? ' match your search' : ''}</div>
      </section>
      <div className="h-16" />

      {(dlg?.kind === 'add' || dlg?.kind === 'edit') && <DivisionDialog key={dlg.item?.id ?? dlg.parentId ?? 'new'} tree={tree} item={dlg.item} parentId={dlg.parentId} onClose={close} onSave={save} />}
      {dlg?.kind === 'upload' && <UploadDialog onClose={close} onDone={() => {}} />}

      {dlg?.kind === 'delete' && (kids > 0 ? (
        <Dlg alert title="This division has divisions inside it" onClose={close}>
          <p><strong>{dlg.item.name}</strong> has {kids} {kids === 1 ? 'division' : 'divisions'} inside it. Delete or move them first.</p>
        </Dlg>
      ) : dlg.item.linked ? (
        <Dlg alert title="This division is in use" onClose={close}>
          <p><strong>{dlg.item.name}</strong> is used by recorded events, so it cannot be deleted. You can still rename it.</p>
        </Dlg>
      ) : (
        <Dlg alert destructive title="Delete division" onClose={close} submitLabel="Delete division"
          onSubmit={() => { setTree((t) => remove(t, dlg.item.id)); notify(`${dlg.item.name} was deleted.`); close(); }}>
          <p><strong>{dlg.item.name}</strong> will be deleted. This cannot be undone.</p>
        </Dlg>
      ))}
    </>
  );
}

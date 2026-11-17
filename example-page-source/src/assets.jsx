import React, { useState } from 'react';
import { Button, Table, TableHeader, TableBody, Column, Row, Cell, SearchField, Input } from 'react-aria-components';
import { Plus, Pencil, Trash2, Eye, Upload, Download } from 'lucide-react';
import { DButton, FilterSelect, SortColumn, sortRows, Pagination } from './ui.jsx';
import { Tooltip, MultiSelect, FileUpload } from '../lib/index';
import { Dlg, Field, Clip } from './kit.jsx';

const SECTORS = ['Agriculture', 'Commerce', 'Education', 'Energy', 'Fisheries', 'Health', 'Housing', 'Telecommunications', 'Tourism', 'Transport', 'Water and sanitation'];
const B = (id, name, category, sectors, notes = '') => ({ id, name, category, sectors, notes, nationalId: '', builtIn: true });
const ASSETS = [
  { id: 101, name: 'Community cyclone shelter', category: 'Public buildings', sectors: ['Housing', 'Education'], notes: 'Shelters built under the 2019 national programme. Often shared with a school.', nationalId: 'HT-ABR', builtIn: false },
  { id: 102, name: 'Tap-tap station', category: 'Transport facilities', sectors: ['Transport'], notes: '', nationalId: 'HT-TTS', builtIn: false },
  { id: 103, name: 'Lakou (shared family compound)', category: 'Dwellings', sectors: ['Housing'], notes: 'Counted as one asset per compound, not per house.', nationalId: '', builtIn: false },
  B(1, 'Primary school', 'Education facilities', ['Education'], 'Includes classrooms, furniture and teaching materials.'),
  B(2, 'Secondary school', 'Education facilities', ['Education']),
  B(3, 'Hospital', 'Health facilities', ['Health'], 'Facilities with inpatient care.'),
  B(4, 'Health centre', 'Health facilities', ['Health']),
  B(5, 'Dwelling, permanent materials', 'Dwellings', ['Housing']),
  B(6, 'Dwelling, light materials', 'Dwellings', ['Housing']),
  B(7, 'Paved road', 'Roads and bridges', ['Transport'], 'Measured in kilometres.'),
  B(8, 'Unpaved road', 'Roads and bridges', ['Transport']),
  B(9, 'Bridge', 'Roads and bridges', ['Transport']),
  B(10, 'Water treatment plant', 'Water supply', ['Water and sanitation']),
  B(11, 'Water distribution network', 'Water supply', ['Water and sanitation']),
  B(12, 'Power substation', 'Electricity', ['Energy']),
  B(13, 'Distribution line', 'Electricity', ['Energy']),
  B(14, 'Mobile network tower', 'Networks', ['Telecommunications']),
  B(15, 'Irrigation canal', 'Farm infrastructure', ['Agriculture', 'Water and sanitation']),
  B(16, 'Grain storage facility', 'Farm infrastructure', ['Agriculture']),
  B(17, 'Fishing boat', 'Vessels and gear', ['Fisheries']),
  B(18, 'Market building', 'Trade facilities', ['Commerce']),
  B(19, 'Hotel', 'Accommodation', ['Tourism']),
  B(20, 'Port facility', 'Ports and airports', ['Transport', 'Commerce', 'Fisheries']),
  B(21, 'Airport runway', 'Ports and airports', ['Transport']),
  B(22, 'Solar mini-grid', 'Electricity', ['Energy']),
  B(23, 'Livestock shelter', 'Farm infrastructure', ['Agriculture']),
  B(24, 'Cold storage room', 'Trade facilities', ['Commerce', 'Fisheries', 'Agriculture']),
  B(25, 'University building', 'Education facilities', ['Education']),
  B(26, 'Sewage treatment plant', 'Sanitation', ['Water and sanitation']),
  B(27, 'Guest house', 'Accommodation', ['Tourism']),
];

function Sectors({ list }) {
  if (!list.length) return <span className="text-fg-2">None</span>;
  const shown = list.slice(0, 2).join(', ');
  return <span title={list.join(', ')}>{shown}{list.length > 2 && <span className="text-fg-2"> +{list.length - 2}</span>}</span>;
}

function AssetDialog({ item, onClose, onSave }) {
  const [f, setF] = useState({ name: item?.name ?? '', category: item?.category ?? '', nationalId: item?.nationalId ?? '', notes: item?.notes ?? '', sectors: item?.sectors ?? [] });
  const [err, setErr] = useState('');
  const set = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); if (k === 'name') setErr(''); };
  return (
    <Dlg wide title={item ? 'Edit asset' : 'Add asset'} onClose={onClose} submitLabel={item ? 'Save changes' : 'Add asset'}
      onSubmit={() => { if (!f.name.trim()) { setErr('Enter a name.'); return; } onSave({ ...f, name: f.name.trim() }); }}>
      <Field label="Name" value={f.name} onChange={set('name')} error={err} autoFocus />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Category" optional value={f.category} onChange={set('category')} />
        <Field label="National ID" optional value={f.nationalId} onChange={set('nationalId')} help="The code your country uses for this asset." />
      </div>
      <div className="field">
        <span className="field-label" id="asset-sectors">Sectors <span className="font-normal text-fg-2">(optional)</span></span>
        <MultiSelect label="Sectors" options={SECTORS} noun={f.sectors.length === 1 ? 'sector' : 'sectors'} placeholder="Select sectors" value={f.sectors} onChange={set('sectors')} />
      </div>
      <Field label="Notes" optional multiline value={f.notes} onChange={set('notes')} />
    </Dlg>
  );
}

export function AssetsView({ notify }) {
  const [assets, setAssets] = useState(ASSETS);
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState({ column: 'name', direction: 'ascending' });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [dlg, setDlg] = useState(null); // { kind: 'add' | 'edit' | 'view' | 'delete' | 'import', item }
  const [files, setFiles] = useState([]);
  const [fileErr, setFileErr] = useState('');

  const filtered = assets.filter((a) => (type === 'All' || (type === 'Custom') === !a.builtIn) && `${a.name} ${a.category} ${a.nationalId}`.toLowerCase().includes(q.toLowerCase()));
  const rows = sortRows(filtered, sort, (a, c) => (c === 'type' ? (a.builtIn ? 'Built-in' : 'Custom') : a[c]));
  const p = Math.min(page, Math.max(1, Math.ceil(rows.length / size)));
  const visible = rows.slice((p - 1) * size, p * size);
  const filtering = q || type !== 'All';
  const close = () => { setDlg(null); setFiles([]); setFileErr(''); };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
        <div className="min-w-0 max-w-[640px] flex-1 basis-[320px]">
          <h1 className="t-page-title">Assets</h1>
          <p className="mt-1 text-fg-2">The types of asset that can be recorded as damaged or destroyed. Built-in assets come with DELTA. Custom assets are your own.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DButton variant="secondary" onPress={() => setDlg({ kind: 'import' })}><Upload className="i" aria-hidden="true" />Import CSV</DButton>
          <DButton variant="secondary" onPress={() => notify(`${rows.length} assets exported to CSV.`)}><Download className="i" aria-hidden="true" />Export CSV</DButton>
          <DButton variant="primary" onPress={() => setDlg({ kind: 'add' })}><Plus className="i" aria-hidden="true" />Add asset</DButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4" role="search">
        <SearchField style={{ width: 340, maxWidth: '100%' }} aria-label="Search by name, category or national ID" value={q} onChange={(v) => { setQ(v); setPage(1); }}>
          <Input className="input w-full" placeholder="Search by name, category or national ID" />
        </SearchField>
        <FilterSelect label="Type" allLabel="All types" options={['All', 'Custom', 'Built-in']} value={type} onChange={(v) => { setType(v); setPage(1); }} />
        {filtering && <DButton variant="ghost" className="ml-auto" onPress={() => { setQ(''); setType('All'); setPage(1); }}>Clear filters</DButton>}
      </div>

      <section className="card overflow-hidden" aria-label="Assets">
        <div className="overflow-x-auto">
          <Table aria-label="Assets" className="dtable dtable-static" sortDescriptor={sort} onSortChange={(d) => { setSort(d); setPage(1); }}>
            <TableHeader>
              <SortColumn id="name" isRowHeader>Name</SortColumn>
              <SortColumn id="category">Category</SortColumn>
              <Column className="t-th">Sectors</Column>
              <SortColumn id="type">Type</SortColumn>
              <Column className="t-th"><span className="sr-only">Actions</span></Column>
            </TableHeader>
            <TableBody items={visible} renderEmptyState={() => <div className="p-6 text-fg-2">No assets match these filters.</div>}>
              {(a) => (
                <Row id={a.id}>
                  <Cell><Clip w={340}>{a.name}</Clip></Cell>
                  <Cell><Clip w={220}>{a.category || '-'}</Clip></Cell>
                  <Cell><Sectors list={a.sectors} /></Cell>
                  <Cell>{a.builtIn ? <span className="text-fg-2">Built-in</span> : 'Custom'}</Cell>
                  <Cell className="num">
                    <span className="inline-flex gap-1">
                      {a.builtIn ? (
                        <Tooltip text="View asset"><Button className="icon-btn" aria-label={`View ${a.name}`} onPress={() => setDlg({ kind: 'view', item: a })}><Eye className="i" aria-hidden="true" /></Button></Tooltip>
                      ) : (
                        <>
                          <Tooltip text="Edit asset"><Button className="icon-btn" aria-label={`Edit ${a.name}`} onPress={() => setDlg({ kind: 'edit', item: a })}><Pencil className="i" aria-hidden="true" /></Button></Tooltip>
                          <Tooltip text="Delete asset"><Button className="icon-btn" aria-label={`Delete ${a.name}`} onPress={() => setDlg({ kind: 'delete', item: a })}><Trash2 className="i" aria-hidden="true" /></Button></Tooltip>
                        </>
                      )}
                    </span>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination total={rows.length} page={p} pageSize={size} onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1); }} noun="assets" />
      </section>
      <div className="h-16" />

      {dlg?.kind === 'add' && <AssetDialog onClose={close} onSave={(f) => { setAssets((l) => [{ id: Date.now(), builtIn: false, ...f }, ...l]); close(); notify(`${f.name} was added.`); }} />}
      {dlg?.kind === 'edit' && <AssetDialog key={dlg.item.id} item={dlg.item} onClose={close} onSave={(f) => { setAssets((l) => l.map((x) => (x.id === dlg.item.id ? { ...x, ...f } : x))); close(); notify('Changes saved.'); }} />}

      {dlg?.kind === 'view' && (
        <Dlg title={dlg.item.name} onClose={close}>
          <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3">
            <dt>Type</dt><dd className="text-fg">Built-in. It comes with DELTA and cannot be changed.</dd>
            <dt>Category</dt><dd className="text-fg">{dlg.item.category || '-'}</dd>
            <dt>Sectors</dt><dd className="text-fg">{dlg.item.sectors.join(', ') || '-'}</dd>
            <dt>Notes</dt><dd className="text-fg">{dlg.item.notes || '-'}</dd>
          </dl>
        </Dlg>
      )}

      {dlg?.kind === 'delete' && (
        <Dlg alert destructive title="Delete asset" onClose={close} submitLabel="Delete asset"
          onSubmit={() => { setAssets((l) => l.filter((x) => x.id !== dlg.item.id)); notify(`${dlg.item.name} was deleted.`); close(); }}>
          <p><strong>{dlg.item.name}</strong> will be deleted. This cannot be undone.</p>
        </Dlg>
      )}

      {dlg?.kind === 'import' && (
        <Dlg wide title="Import assets from CSV" onClose={close} submitLabel="Import"
          onSubmit={() => { if (!files.length) { setFileErr('Choose a CSV file to import.'); return; } close(); notify('12 assets imported.'); }}>
          <p>Each row in the file becomes a custom asset. Use the columns name, category, national ID, sectors and notes.</p>
          <div className="flex flex-col gap-2">
            <FileUpload hint="One CSV file, up to 10 MB" onFiles={(fl) => { setFiles(fl.slice(0, 1)); setFileErr(''); }} />
            {files.length > 0 && <p className="text-fg" role="status">Selected file: {files[0].name}</p>}
            {fileErr && <p className="field-error" role="alert">{fileErr}</p>}
          </div>
        </Dlg>
      )}
    </>
  );
}

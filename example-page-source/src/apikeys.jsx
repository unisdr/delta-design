import React, { useState } from 'react';
import { Button, Table, TableHeader, TableBody, Column, Row, Cell, TextField, Label, Input } from 'react-aria-components';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { DButton, SortColumn, sortRows, Pagination } from './ui.jsx';
import { Tooltip, MessageBanner } from '../lib/index';
import { Dlg, Field, Clip } from './kit.jsx';

const KEYS = [
  { id: 1, name: 'National statistics sync', by: 'anna.charles@ihsi.ht', secret: 'dk_7f3a9c2e41b84d06a5e2c97b10f3d8aa', created: '2026-09-18' },
  { id: 2, name: 'Early warning dashboard', by: 'marie.joseph@dgpc.gouv.ht', secret: 'dk_b21e0d7c9a4f4c1e8d3360f5a7b942c1', created: '2026-08-04' },
  { id: 3, name: 'Red Cross field app', by: 'louis.gabriel@redcross.ht', secret: 'dk_04c8e6a1f7d24b93b0a5d1e86c7f3920', created: '2026-06-22' },
];
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const newSecret = () => 'dk_' + Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const copy = (text) => { try { navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* clipboard not available */ } };

function NameDialog({ item, names, onClose, onSave }) {
  const [name, setName] = useState(item?.name ?? '');
  const [err, setErr] = useState('');
  return (
    <Dlg title={item ? 'Rename API key' : 'Add API key'} onClose={onClose} submitLabel={item ? 'Save changes' : 'Create key'}
      onSubmit={() => {
        const v = name.trim();
        if (!v) { setErr('Enter a name.'); return; }
        if (names.some((n) => n.toLowerCase() === v.toLowerCase() && n !== item?.name)) { setErr('A key with this name already exists.'); return; }
        onSave(v);
      }}>
      <Field label="Name" value={name} onChange={(v) => { setName(v); setErr(''); }} error={err} autoFocus
        help="Name the key after the application that will use it." />
    </Dlg>
  );
}

export function ApiKeysView({ notify }) {
  const [keys, setKeys] = useState(KEYS);
  const [sort, setSort] = useState({ column: 'created', direction: 'descending' });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [created, setCreated] = useState(null);

  const rows = sortRows(keys, sort, (k, c) => k[c]);
  const p = Math.min(page, Math.max(1, Math.ceil(rows.length / size)));
  const visible = rows.slice((p - 1) * size, p * size);
  const names = keys.map((k) => k.name);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
        <div>
          <h1 className="t-page-title">API keys</h1>
          <p className="mt-1 text-fg-2">Keys that let other applications read and send data for this site.</p>
        </div>
        <DButton variant="primary" onPress={() => setAdd(true)}><Plus className="i" aria-hidden="true" />Add API key</DButton>
      </div>

      <section className="card overflow-hidden" aria-label="API keys">
        <div className="overflow-x-auto">
          <Table aria-label="API keys" className="dtable dtable-static" sortDescriptor={sort} onSortChange={(d) => { setSort(d); setPage(1); }}>
            <TableHeader>
              <SortColumn id="name" isRowHeader>Name</SortColumn>
              <Column className="t-th">Key</Column>
              <SortColumn id="by">Managed by</SortColumn>
              <SortColumn id="created">Created</SortColumn>
              <Column className="t-th"><span className="sr-only">Actions</span></Column>
            </TableHeader>
            <TableBody items={visible} renderEmptyState={() => (
              <div className="flex flex-col items-start gap-3 p-6 text-fg-2">
                No API keys yet. Add one when another application needs access to this site's data.
                <DButton variant="secondary" onPress={() => setAdd(true)}>Add API key</DButton>
              </div>
            )}>
              {(k) => (
                <Row id={k.id}>
                  <Cell><Clip w={320}>{k.name}</Clip></Cell>
                  <Cell>
                    <span className="inline-flex items-center gap-1">
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{k.secret.slice(0, 8)}…</span>
                      <Tooltip text="Copy key"><Button className="icon-btn" aria-label={`Copy key for ${k.name}`} onPress={() => { copy(k.secret); notify('Key copied.'); }}><Copy className="i" aria-hidden="true" /></Button></Tooltip>
                    </span>
                  </Cell>
                  <Cell><Clip w={260}>{k.by}</Clip></Cell>
                  <Cell className="tnum">{fmt(k.created)}</Cell>
                  <Cell className="num">
                    <span className="inline-flex gap-1">
                      <Tooltip text="Rename key"><Button className="icon-btn" aria-label={`Rename ${k.name}`} onPress={() => setEdit(k)}><Pencil className="i" aria-hidden="true" /></Button></Tooltip>
                      <Tooltip text="Delete key"><Button className="icon-btn" aria-label={`Delete ${k.name}`} onPress={() => setDel(k)}><Trash2 className="i" aria-hidden="true" /></Button></Tooltip>
                    </span>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination total={rows.length} page={p} pageSize={size} onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1); }} noun="keys" />
      </section>
      <div className="h-16" />

      {add && <NameDialog names={names} onClose={() => setAdd(false)}
        onSave={(name) => { const k = { id: Date.now(), name, by: 'user@example.org', secret: newSecret(), created: new Date().toISOString().slice(0, 10) }; setKeys((l) => [k, ...l]); setAdd(false); setCreated(k); }} />}
      {edit && <NameDialog key={edit.id} item={edit} names={names} onClose={() => setEdit(null)}
        onSave={(name) => { setKeys((l) => l.map((x) => (x.id === edit.id ? { ...x, name } : x))); setEdit(null); notify('Changes saved.'); }} />}

      {created && (
        <Dlg wide title="API key created" onClose={() => setCreated(null)} closeLabel="Done">
          <MessageBanner tone="success" title={`${created.name} is ready to use`}>Copy the key and add it to the application that needs it.</MessageBanner>
          <div className="flex items-end gap-2">
            <TextField className="field min-w-0 flex-1" value={created.secret} isReadOnly>
              <Label className="field-label">Key</Label>
              <Input className="input w-full" style={{ fontFamily: 'var(--font-mono)' }} onFocus={(e) => e.target.select()} />
            </TextField>
            <DButton variant="secondary" onPress={() => { copy(created.secret); notify('Key copied.'); }}><Copy className="i" aria-hidden="true" />Copy key</DButton>
          </div>
        </Dlg>
      )}

      {del && (
        <Dlg alert destructive title="Delete API key" onClose={() => setDel(null)} submitLabel="Delete key"
          onSubmit={() => { setKeys((l) => l.filter((x) => x.id !== del.id)); notify(`${del.name} was deleted.`); setDel(null); }}>
          <p><strong>{del.name}</strong> will be deleted. Applications that use this key will stop working straight away. This cannot be undone.</p>
        </Dlg>
      )}
    </>
  );
}

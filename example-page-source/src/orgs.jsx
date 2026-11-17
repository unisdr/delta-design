import React, { useState } from 'react';
import {
  Button, Table, TableHeader, TableBody, Column, Row, Cell, SearchField, Input, TextField, Label, FieldError,
  ModalOverlay, Modal, Dialog, Heading,
} from 'react-aria-components';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DButton, SortColumn, sortRows, Pagination } from './ui.jsx';
import { Tooltip } from '../lib/index';

const ORGS = [
  { id: 1, name: 'DGPC Haiti', users: 4 },
  { id: 2, name: 'Ministry of Interior', users: 2 },
  { id: 3, name: 'Red Cross Haiti', users: 2 },
  { id: 4, name: 'Statistics Office', users: 2 },
  { id: 5, name: 'UNDRR Bangkok', users: 1 },
  { id: 6, name: 'Ministry of Public Health and Population', users: 0 },
  { id: 7, name: 'Ministry of Agriculture, Natural Resources and Rural Development', users: 0 },
  { id: 8, name: 'National Centre for Geospatial Information', users: 3 },
  { id: 9, name: 'Hydrometeorological Unit of Haiti', users: 1 },
  { id: 10, name: 'Ministry of Public Works, Transport and Communications', users: 0 },
  { id: 11, name: 'Civil Protection Committee, Ouest', users: 0 },
];
const DEPTS = ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Sud', 'Sud-Est'];
DEPTS.forEach((d, i) => { ORGS.push({ id: 20 + i, name: `Civil Protection Committee, ${d}`, users: (i * 3) % 5 }); ORGS.push({ id: 40 + i, name: `Departmental Health Directorate, ${d}`, users: i % 3 === 0 ? 1 : 0 }); });
const plural = (n) => `${n} ${n === 1 ? 'user' : 'users'}`;

function Clip({ w, children }) {
  return <span className="block truncate" style={{ maxWidth: w }} title={children}>{children}</span>;
}

function OrgDialog({ org, names, onClose, onSave }) {
  const editing = !!org;
  const [name, setName] = useState(org?.name ?? '');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) { setErr('Enter a name.'); return; }
    if (names.some((n) => n.toLowerCase() === v.toLowerCase() && n !== org?.name)) { setErr('An organization with this name already exists.'); return; }
    onSave(v);
  };
  return (
    <ModalOverlay className="scrim" isOpen onOpenChange={(o) => { if (!o) onClose(); }} isDismissable>
      <Modal className="modal">
        <Dialog className="modal-dialog">
          {({ close }) => (
            <form onSubmit={submit} noValidate>
              <div className="modal-head">
                <Heading slot="title" className="t-section">{editing ? 'Edit organization' : 'Add organization'}</Heading>
                <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
              </div>
              <div className="modal-body">
                <TextField className="field" value={name} onChange={(v) => { setName(v); setErr(''); }} isInvalid={!!err} autoFocus>
                  <Label className="field-label">Name</Label>
                  <Input className="input w-full" />
                  <FieldError className="field-error">{err}</FieldError>
                </TextField>
              </div>
              <div className="modal-foot">
                <DButton variant="secondary" onPress={close}>Cancel</DButton>
                <DButton variant="primary" type="submit">{editing ? 'Save changes' : 'Add organization'}</DButton>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export function OrgsView({ notify }) {
  const [orgs, setOrgs] = useState(ORGS);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  const [sort, setSort] = useState({ column: 'name', direction: 'ascending' });
  const rows = sortRows(orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase())), sort, (o, c) => o[c]);
  const [size, setSize] = useState(25);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages);
  const visible = rows.slice((p - 1) * size, p * size);
  const names = orgs.map((o) => o.name);
  const blocked = del && del.users > 0;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
        <div>
          <h1 className="t-page-title">Organizations</h1>
          <p className="mt-1 text-fg-2">The organizations people on this site belong to.</p>
        </div>
        <DButton variant="primary" onPress={() => setAdd(true)}><Plus className="i" aria-hidden="true" />Add organization</DButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4" role="search">
        <SearchField style={{ width: 340, maxWidth: '100%' }} aria-label="Search by name" value={q} onChange={(v) => { setQ(v); setPage(1); }}>
          <Input className="input w-full" placeholder="Search by name" />
        </SearchField>
      </div>

      <section className="card overflow-hidden" aria-label="Organizations">
        <div className="overflow-x-auto">
          <Table aria-label="Organizations" className="dtable dtable-static" sortDescriptor={sort} onSortChange={(d) => { setSort(d); setPage(1); }}>
            <TableHeader>
              <SortColumn id="name" isRowHeader>Name</SortColumn>
              <SortColumn id="users">Users</SortColumn>
              <Column className="t-th"><span className="sr-only">Actions</span></Column>
            </TableHeader>
            <TableBody items={visible} renderEmptyState={() => (
              <div className="flex flex-col items-start gap-3 p-6 text-fg-2">
                {q ? <>No organizations match "{q}".<DButton variant="secondary" onPress={() => setQ('')}>Clear search</DButton></> : 'No organizations yet.'}
              </div>
            )}>
              {(o) => (
                <Row id={o.id}>
                  <Cell><Clip w={560}>{o.name}</Clip></Cell>
                  <Cell className="tnum">{o.users}</Cell>
                  <Cell className="num">
                    <span className="inline-flex gap-1">
                      <Tooltip text="Edit organization"><Button className="icon-btn" aria-label={`Edit ${o.name}`} onPress={() => setEdit(o)}><Pencil className="i" aria-hidden="true" /></Button></Tooltip>
                      <Tooltip text="Delete organization"><Button className="icon-btn" aria-label={`Delete ${o.name}`} onPress={() => setDel(o)}><Trash2 className="i" aria-hidden="true" /></Button></Tooltip>
                    </span>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination total={rows.length} page={p} pageSize={size} onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1); }} noun="organizations" />
      </section>
      <div className="h-16" />

      {add && <OrgDialog names={names} onClose={() => setAdd(false)}
        onSave={(name) => { setOrgs((l) => [...l, { id: Date.now(), name, users: 0 }]); setAdd(false); notify(`${name} was added.`); }} />}
      {edit && <OrgDialog key={edit.id} org={edit} names={names} onClose={() => setEdit(null)}
        onSave={(name) => { setOrgs((l) => l.map((x) => (x.id === edit.id ? { ...x, name } : x))); setEdit(null); notify('Changes saved.'); }} />}

      <ModalOverlay className="scrim" isOpen={!!del} onOpenChange={(o) => { if (!o) setDel(null); }} isDismissable>
        <Modal className="modal">
          <Dialog className="modal-dialog" role="alertdialog">
            {({ close }) => (
              <>
                <div className="modal-head">
                  <Heading slot="title" className="t-section">{blocked ? 'This organization is in use' : 'Delete organization'}</Heading>
                  <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
                </div>
                <div className="modal-body">
                  {blocked
                    ? <><strong>{del?.name}</strong> has {plural(del?.users)}. Move them to another organization in Access management, then delete it.</>
                    : <><strong>{del?.name}</strong> will be deleted. This cannot be undone.</>}
                </div>
                <div className="modal-foot">
                  {blocked
                    ? <DButton variant="primary" onPress={close}>Close</DButton>
                    : <>
                        <DButton variant="secondary" onPress={close}>Cancel</DButton>
                        <DButton variant="destructive" onPress={() => { setOrgs((l) => l.filter((x) => x.id !== del.id)); notify(`${del.name} was deleted.`); close(); }}>Delete organization</DButton>
                      </>}
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}

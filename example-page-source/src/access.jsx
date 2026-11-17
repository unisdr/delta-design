import React, { useState } from 'react';
import {
  Button, Table, TableHeader, TableBody, Column, Row, Cell, SearchField, Input, TextField, Label, FieldError,
  Select, SelectValue, Popover, ListBox, ListBoxItem, ModalOverlay, Modal, Dialog, Heading, Text,
} from 'react-aria-components';
import { Plus, Pencil, Send, Trash2, ChevronLeft, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { DButton, Badge, FilterSelect, SortColumn, sortRows, Pagination } from './ui.jsx';
import { Tooltip } from '../lib/index';

const ROLES = [
  { id: 'Data viewer', desc: 'view data and use analytics.' },
  { id: 'Data collector', desc: 'add, edit and import data.' },
  { id: 'Data validator', desc: 'validate data.' },
  { id: 'Admin', desc: 'manage access and country settings.' },
  { id: 'Super admin', desc: 'manage global access and country accounts.' },
];
const ORGS = ['DGPC Haiti', 'UNDRR Bangkok', 'Ministry of Interior', 'Red Cross Haiti', 'Statistics Office'];
const USERS = [
  { id: 1, first: 'Marie', last: 'Joseph', email: 'marie.joseph@dgpc.gouv.ht', org: 'DGPC Haiti', role: 'Admin', added: '2026-09-14', active: true },
  { id: 2, first: 'Jean', last: 'Baptiste', email: 'jean.baptiste@dgpc.gouv.ht', org: 'DGPC Haiti', role: 'Data collector', added: '2026-09-02', active: true },
  { id: 3, first: 'Claire', last: 'Dubois', email: 'claire.dubois@redcross.ht', org: 'Red Cross Haiti', role: 'Data viewer', added: '2026-08-28', active: false },
  { id: 4, first: 'Pierre', last: 'Louis', email: 'pierre.louis@mci.gouv.ht', org: 'Ministry of Interior', role: 'Data validator', added: '2026-08-19', active: true },
  { id: 5, first: 'Anna', last: 'Charles', email: 'anna.charles@ihsi.ht', org: 'Statistics Office', role: 'Data collector', added: '2026-08-11', active: true },
  { id: 6, first: 'Samuel', last: 'Noel', email: 'samuel.noel@dgpc.gouv.ht', org: 'DGPC Haiti', role: 'Data viewer', added: '2026-07-30', active: false },
  { id: 7, first: 'Nadia', last: 'Pierre', email: 'nadia.pierre@undrr.org', org: 'UNDRR Bangkok', role: 'Super admin', added: '2026-07-21', active: true },
  { id: 8, first: 'Louis', last: 'Gabriel', email: 'louis.gabriel@redcross.ht', org: 'Red Cross Haiti', role: 'Data collector', added: '2026-07-09', active: true },
  { id: 9, first: 'Rose', last: 'Antoine', email: 'rose.antoine@mci.gouv.ht', org: 'Ministry of Interior', role: 'Data viewer', added: '2026-06-24', active: true },
  { id: 10, first: 'David', last: 'Etienne', email: 'david.etienne@ihsi.ht', org: 'Statistics Office', role: 'Data validator', added: '2026-06-03', active: true },
];
const MORE_FIRST = ['Esther', 'Marc', 'Josette', 'Emmanuel', 'Fabiola', 'Wilson', 'Guerline', 'Patrick', 'Mirlande', 'Stanley', 'Roseline', 'Kervens'];
const MORE_LAST = ['Jean-Louis', 'Saint-Fleur', 'Desir', 'Augustin', 'Michel', 'Toussaint', 'Lafleur', 'Paul', 'Vincent'];
const DOMAIN = { 'DGPC Haiti': 'dgpc.gouv.ht', 'Ministry of Interior': 'mci.gouv.ht', 'Red Cross Haiti': 'redcross.ht', 'Statistics Office': 'ihsi.ht', 'UNDRR Bangkok': 'undrr.org' };
const ROLE_MIX = ['Data collector', 'Data viewer', 'Data collector', 'Data validator', 'Data viewer', 'Admin'];
for (let i = 0; i < 54; i++) {
  const first = MORE_FIRST[i % MORE_FIRST.length], last = MORE_LAST[(i * 5 + (i / 12 | 0)) % MORE_LAST.length], org = [ORGS[0], ORGS[2], ORGS[3], ORGS[4]][i % 4];
  const d = new Date(Date.UTC(2026, 4, 28) - i * 86400000 * 3);
  USERS.push({ id: 11 + i, first, last, email: `${first}.${last}`.toLowerCase() + '@' + DOMAIN[org], org, role: ROLE_MIX[i % ROLE_MIX.length], added: d.toISOString().slice(0, 10), active: i % 9 !== 4 });
}
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/* Long text is cut off with an ellipsis at a fixed width; the full text shows on hover. */
function Clip({ w, children }) {
  const text = React.Children.toArray(children).join('');
  return <span className="block truncate" style={{ maxWidth: w }} title={text}>{children}</span>;
}

function FormSelect({ label, items, value, onChange, placeholder, error }) {
  return (
    <Select className="field" selectedKey={value} onSelectionChange={onChange} isInvalid={!!error}>
      <Label className="field-label">{label}</Label>
      <Button className="select-trigger">
        <SelectValue className="sel-value">{({ selectedText }) => selectedText || <span className="text-fg-2">{placeholder}</span>}</SelectValue>
        <ChevronDown className="i chev" aria-hidden="true" />
      </Button>
      {error && <Text slot="errorMessage" className="field-error">{error}</Text>}
      <Popover className="pop" offset={4}>
        <div className="pop-card" style={{ minWidth: 'var(--trigger-width)' }}>
          <ListBox className="menu-list" aria-label={label}>
            {items.map((o) => (
              <ListBoxItem key={o} id={o} textValue={o} className="menu-item">
                {({ isSelected }) => (<><span className="option-label">{o}</span>{isSelected && <Check className="i" aria-hidden="true" />}</>)}
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      </Popover>
    </Select>
  );
}

function InviteDialog({ isOpen, onClose, onInvite, user }) {
  const editing = !!user;
  const [email, setEmail] = useState(user?.email ?? '');
  const [org, setOrg] = useState(user?.org ?? null);
  const [role, setRole] = useState(user?.role ?? null);
  const [errs, setErrs] = useState({});
  const clear = (k) => setErrs((e) => ({ ...e, [k]: undefined }));
  const reset = () => { setEmail(user?.email ?? ''); setOrg(user?.org ?? null); setRole(user?.role ?? null); setErrs({}); };
  const submit = (e) => {
    e.preventDefault();
    const n = {};
    if (!email) n.email = 'Enter an email address.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) n.email = 'Enter an email address, for example name@organization.org.';
    if (!org) n.org = 'Select an organization.';
    if (!role) n.role = 'Select a role.';
    setErrs(n);
    if (Object.keys(n).length) return;
    onInvite({ email, org, role });
    reset();
  };
  const desc = ROLES.find((r) => r.id === role)?.desc;
  return (
    <ModalOverlay className="scrim" isOpen={isOpen} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} isDismissable>
      <Modal className="modal">
        <Dialog className="modal-dialog">
          {({ close }) => (
            <form onSubmit={submit} noValidate>
              <div className="modal-head">
                <Heading slot="title" className="t-section">{editing ? 'Edit user' : 'Invite user'}</Heading>
                <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
              </div>
              <div className="modal-body flex flex-col gap-6">
                <TextField className="field" type="email" value={email} onChange={(v) => { setEmail(v); clear('email'); }} isInvalid={!!errs.email}>
                  <Label className="field-label">Email address</Label>
                  <Input className="input w-full" placeholder="name@organization.org" />
                  <FieldError className="field-error">{errs.email}</FieldError>
                </TextField>
                <FormSelect label="Organization" items={ORGS} value={org} onChange={(v) => { setOrg(v); clear('org'); }} placeholder="Select an organization" error={errs.org} />
                <div className="flex flex-col gap-2">
                  <FormSelect label="Role" items={ROLES.map((r) => r.id)} value={role} onChange={(v) => { setRole(v); clear('role'); }} placeholder="Select a role" error={errs.role} />
                  {desc && <p className="field-help" aria-live="polite">A {role.toLowerCase()} can {desc}</p>}
                </div>
              </div>
              <div className="modal-foot">
                <DButton variant="secondary" onPress={close}>Cancel</DButton>
                <DButton variant="primary" type="submit">{editing ? 'Save changes' : 'Send invitation'}</DButton>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export function AccessView({ notify }) {
  const [users, setUsers] = useState(USERS);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);
  const [invite, setInvite] = useState(false);
  const [del, setDel] = useState(null);
  const [edit, setEdit] = useState(null);

  const [sort, setSort] = useState({ column: 'added', direction: 'descending' });
  const rows = sortRows(users.filter((u) => (role === 'All' || u.role === role) && `${u.first} ${u.last} ${u.email} ${u.org}`.toLowerCase().includes(q.toLowerCase())), sort,
    (u, c) => (c === 'name' ? `${u.first} ${u.last}` : c === 'status' ? (u.active ? 'Active' : 'Invited') : u[c]));
  const [size, setSize] = useState(25);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages);
  const visible = rows.slice((p - 1) * size, p * size);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
        <div>
          <h1 className="t-page-title">Access management</h1>
          <p className="mt-1 text-fg-2">Invite people and set what they can do on this site.</p>
        </div>
        <DButton variant="primary" onPress={() => setInvite(true)}><Plus className="i" aria-hidden="true" />Invite user</DButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4" role="search">
        <SearchField style={{ width: 340 }} aria-label="Search by name, email or organization" value={q} onChange={(v) => { setQ(v); setPage(1); }}>
          <Input className="input w-full" placeholder="Search by name, email or organization" />
        </SearchField>
        <FilterSelect label="Role" allLabel="All roles" value={role} onChange={(v) => { setRole(v); setPage(1); }}
          options={['All', ...ROLES.map((r) => r.id)]} />
        <span className="flex-1" />
        <DButton variant="ghost" onPress={() => { setQ(''); setRole('All'); setPage(1); }}>Clear filters</DButton>
      </div>

      {role !== 'All' && <p className="pb-4 text-fg-2">{role}: {ROLES.find((r) => r.id === role).desc}</p>}

      <section className="card overflow-hidden" aria-label="Users">
        <div className="overflow-x-auto">
          <Table aria-label="Users" className="dtable dtable-static" sortDescriptor={sort} onSortChange={(d) => { setSort(d); setPage(1); }}>
            <TableHeader>
              <SortColumn id="name" isRowHeader>Name</SortColumn>
              <SortColumn id="status">Status</SortColumn>
              <Column className="t-th">Email</Column>
              <SortColumn id="org">Organization</SortColumn>
              <SortColumn id="role">Role</SortColumn>
              <SortColumn id="added">Date added</SortColumn>
              <Column className="t-th"><span className="sr-only">Actions</span></Column>
            </TableHeader>
            <TableBody items={visible} renderEmptyState={() => <div className="p-6 text-fg-2">No users match these filters.</div>}>
              {(u) => (
                <Row id={u.id}>
                  <Cell><Clip w={200}>{u.first} {u.last}</Clip></Cell>
                  <Cell><Badge tone={u.active ? 'positive' : 'warning'}>{u.active ? 'Active' : 'Invitation pending'}</Badge></Cell>
                  <Cell><Clip w={260}>{u.email}</Clip></Cell>
                  <Cell><Clip w={180}>{u.org}</Clip></Cell>
                  <Cell>{u.role}</Cell>
                  <Cell className="tnum">{fmt(u.added)}</Cell>
                  <Cell className="num">
                    <span className="inline-flex gap-1">
                      {u.active ? <span className="w-8" aria-hidden="true" /> : (
                        <Tooltip text="Resend invitation"><Button className="icon-btn" aria-label={`Resend invitation to ${u.first} ${u.last}`} onPress={() => notify(`Invitation sent again to ${u.email}.`)}><Send className="i" aria-hidden="true" /></Button></Tooltip>
                      )}
                      <Tooltip text="Edit user"><Button className="icon-btn" aria-label={`Edit ${u.first} ${u.last}`} onPress={() => setEdit(u)}><Pencil className="i" aria-hidden="true" /></Button></Tooltip>
                      <Tooltip text="Delete user"><Button className="icon-btn" aria-label={`Delete ${u.first} ${u.last}`} onPress={() => setDel(u)}><Trash2 className="i" aria-hidden="true" /></Button></Tooltip>
                    </span>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination total={rows.length} page={p} pageSize={size} onPage={setPage} onPageSize={(n) => { setSize(n); setPage(1); }} noun="users" />
      </section>
      <div className="h-16" />

      <InviteDialog isOpen={invite} onClose={() => setInvite(false)}
        onInvite={({ email, org, role: r }) => {
          const name = email.split('@')[0].split('.');
          const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
          setUsers((l) => [{ id: Date.now(), first: cap(name[0]), last: cap(name[1] || ''), email, org, role: r, added: '2026-11-11', active: false }, ...l]);
          setInvite(false); notify(`Invitation sent to ${email}.`);
        }} />

      {edit && (
        <InviteDialog key={edit.id} user={edit} isOpen onClose={() => setEdit(null)}
          onInvite={({ email, org, role: r }) => {
            setUsers((l) => l.map((x) => (x.id === edit.id ? { ...x, email, org, role: r } : x)));
            notify(`Changes saved for ${edit.first} ${edit.last}.`); setEdit(null);
          }} />
      )}

      <ModalOverlay className="scrim" isOpen={!!del} onOpenChange={(o) => { if (!o) setDel(null); }} isDismissable>
        <Modal className="modal">
          <Dialog className="modal-dialog" role="alertdialog">
            {({ close }) => (
              <>
                <div className="modal-head">
                  <Heading slot="title" className="t-section">Delete user</Heading>
                  <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
                </div>
                <div className="modal-body">
                  <strong>{del?.first} {del?.last}</strong> will lose access to DELTA. This cannot be undone.
                </div>
                <div className="modal-foot">
                  <DButton variant="secondary" onPress={close}>Cancel</DButton>
                  <DButton variant="destructive" onPress={() => { setUsers((l) => l.filter((x) => x.id !== del.id)); notify(`${del.first} ${del.last} was deleted.`); close(); }}>Delete user</DButton>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}

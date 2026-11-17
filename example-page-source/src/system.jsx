import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { DButton } from './ui.jsx';
import { Dlg, Field, SelectField } from './kit.jsx';

const LANGS = [{ id: 'en', label: 'English' }, { id: 'fr', label: 'French' }, { id: 'es', label: 'Spanish' }, { id: 'ar', label: 'Arabic' }, { id: 'ru', label: 'Russian' }, { id: 'zh', label: 'Chinese' }];

function Group({ title, note, action, children }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2 pb-2">
        <div>
          <h2 className="t-section">{title}</h2>
          {note && <p className="mt-1 text-label text-fg-2">{note}</p>}
        </div>
        {action}
      </div>
      <section className="card mb-8 overflow-hidden" aria-label={title}>
        <dl>{children}</dl>
      </section>
    </>
  );
}
function Item({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-border px-6 py-3 last:border-b-0 md:grid-cols-[220px_minmax(0,1fr)]">
      <dt className="text-fg-2">{label}</dt>
      <dd className="min-w-0 break-words text-fg">{children}</dd>
    </div>
  );
}

function EditDialog({ s, onClose, onSave }) {
  const [name, setName] = useState(s.name);
  const [lang, setLang] = useState(s.lang);
  const [err, setErr] = useState('');
  return (
    <Dlg title="Edit instance settings" onClose={onClose} submitLabel="Save changes"
      onSubmit={() => { if (!name.trim()) { setErr('Enter an instance name.'); return; } onSave({ name: name.trim(), lang }); }}>
      <Field label="Instance name" value={name} onChange={(v) => { setName(v); setErr(''); }} error={err} help="Shown in the site selector and in emails." />
      <SelectField label="Language" items={LANGS} value={lang} onChange={setLang} help="The default language for everyone on this instance." />
      <p className="text-label">Changes apply the next time you sign in.</p>
    </Dlg>
  );
}

export function SystemView({ notify }) {
  const [s, setS] = useState({ name: 'DGPC Haiti', lang: 'fr' });
  const [edit, setEdit] = useState(false);
  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">System settings</h1>
        <p className="mt-1 text-fg-2">How this instance of DELTA Resilience is set up.</p>
      </div>

      <Group title="Instance" action={<DButton variant="secondary" onPress={() => setEdit(true)}><Pencil className="i" aria-hidden="true" />Edit</DButton>}>
        <Item label="Instance name">{s.name}</Item>
        <Item label="Language">{LANGS.find((l) => l.id === s.lang).label}</Item>
        <Item label="Application URL">https://delta.undrr.org/haiti</Item>
        <Item label="Name shown in authenticator apps">DELTA Resilience Haiti</Item>
      </Group>

      <Group title="Country" note="Set when the instance was created. Contact UNDRR to change it.">
        <Item label="Country">Haiti</Item>
        <Item label="Type">Official</Item>
        <Item label="Currency">HTG, Haitian gourde</Item>
      </Group>

      <Group title="Email" note="Set on the server. How DELTA sends invitations and password emails.">
        <Item label="Transport">SMTP</Item>
        <Item label="Host">smtp.undrr.org</Item>
        <Item label="Port"><span className="tnum">587</span></Item>
        <Item label="Secure connection">Yes</Item>
      </Group>

      <Group title="Software">
        <Item label="DELTA Resilience version"><span className="tnum">1.4.2</span></Item>
      </Group>
      <div className="h-8" />

      {edit && <EditDialog s={s} onClose={() => setEdit(false)} onSave={(n) => { setS(n); setEdit(false); notify('Settings saved. They apply the next time you sign in.'); }} />}
    </>
  );
}

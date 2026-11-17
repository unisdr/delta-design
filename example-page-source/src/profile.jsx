import React, { useState } from 'react';
import { Button, TextField, Label, Input, FieldError, ModalOverlay, Modal, Dialog, Heading } from 'react-aria-components';
import { X, Copy } from 'lucide-react';
import { DButton, Badge } from './ui.jsx';
import { PasswordField } from '../lib/index';

const isCode = (v) => /^\d{6}$/.test(v.replace(/\s/g, ''));
const KEY = 'JBSW Y3DP EHPK 3PXP';

function Dlg({ title, onClose, onSubmit, submitLabel, destructive, children, wide }) {
  return (
    <ModalOverlay className="scrim" isOpen onOpenChange={(o) => { if (!o) onClose(); }} isDismissable>
      <Modal className="modal" style={wide ? { width: 520 } : undefined}>
        <Dialog className="modal-dialog">
          {({ close }) => (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate>
              <div className="modal-head">
                <Heading slot="title" className="t-section">{title}</Heading>
                <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
              </div>
              <div className="modal-body flex flex-col gap-6">{children}</div>
              <div className="modal-foot">
                <DButton variant="secondary" onPress={close}>Cancel</DButton>
                <DButton variant={destructive ? 'destructive' : 'primary'} type="submit">{submitLabel}</DButton>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function Text1({ label, value, onChange, error, ...rest }) {
  return (
    <TextField className="field" value={value} onChange={onChange} isInvalid={!!error} {...rest}>
      <Label className="field-label">{label}</Label>
      <Input className="input w-full" />
      <FieldError className="field-error">{error}</FieldError>
    </TextField>
  );
}

function NameDialog({ me, onClose, onSave }) {
  const [f, setF] = useState(me.first); const [l, setL] = useState(me.last); const [e, setE] = useState({});
  return (
    <Dlg title="Edit name" onClose={onClose} submitLabel="Save"
      onSubmit={() => { const n = {}; if (!f.trim()) n.f = 'Enter your first name.'; if (!l.trim()) n.l = 'Enter your last name.'; setE(n); if (!Object.keys(n).length) onSave(f.trim(), l.trim()); }}>
      <Text1 label="First name" value={f} onChange={(v) => { setF(v); setE((x) => ({ ...x, f: undefined })); }} error={e.f} autoComplete="given-name" />
      <Text1 label="Last name" value={l} onChange={(v) => { setL(v); setE((x) => ({ ...x, l: undefined })); }} error={e.l} autoComplete="family-name" />
    </Dlg>
  );
}

function PasswordDialog({ onClose, onSave }) {
  const [c, setC] = useState(''); const [a, setA] = useState(''); const [b, setB] = useState(''); const [e, setE] = useState({});
  const clr = (k) => setE((x) => ({ ...x, [k]: undefined }));
  return (
    <Dlg title="Change password" onClose={onClose} submitLabel="Change password"
      onSubmit={() => {
        const n = {};
        if (!c) n.c = 'Enter your current password.'; else if (c === 'wrong') n.c = 'The current password is not correct.';
        if (a.length < 12) n.a = 'Use at least 12 characters.';
        if (b !== a) n.b = 'The passwords do not match.';
        setE(n); if (!Object.keys(n).length) onSave();
      }}>
      <PasswordField label="Current password" value={c} onChange={(v) => { setC(v); clr('c'); }} error={e.c} autoComplete="current-password" />
      <PasswordField label="New password" value={a} onChange={(v) => { setA(v); clr('a'); }} error={e.a} autoComplete="new-password" help="At least 12 characters, with two of: uppercase, lowercase, numbers, special characters." />
      <PasswordField label="Confirm new password" value={b} onChange={(v) => { setB(v); clr('b'); }} error={e.b} autoComplete="new-password" />
    </Dlg>
  );
}

function FakeQr() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => { const x = i % 21, y = (i / 21) | 0; const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); return f ? (x % 6 === 0 || y % 6 === 0 || x % 6 === 6 || (x % 7 > 1 && x % 7 < 5 && y % 7 > 1 && y % 7 < 5)) : ((x * 7 + y * 13 + x * y) % 3 === 0); });
  return (
    <svg viewBox="0 0 21 21" width="136" height="136" role="img" aria-label="QR code for the authenticator app" className="rounded-md border border-border bg-white p-2" shapeRendering="crispEdges">
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={(i / 21) | 0} width="1" height="1" fill="#1A1714" />)}
    </svg>
  );
}

function TotpOn({ onClose, onDone }) {
  const [code, setCode] = useState(''); const [err, setErr] = useState('');
  return (
    <Dlg wide title="Turn on two-step verification" onClose={onClose} submitLabel="Turn on"
      onSubmit={() => { if (!isCode(code)) setErr('Enter the 6-digit code from your app.'); else onDone(); }}>
      <ol className="flex list-decimal flex-col gap-1 pl-5">
        <li>Install an authenticator app on your phone, for example Google Authenticator or Microsoft Authenticator.</li>
        <li>Scan the QR code below to add your account.</li>
        <li>Enter the 6-digit code from the app to confirm.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-6">
        <FakeQr />
        <div className="flex min-w-0 flex-col gap-2">
          <p>Cannot scan the code? Use this setup key:</p>
          <p className="tnum break-all font-medium text-fg">{KEY}</p>
          <div><DButton variant="ghost" onPress={() => { try { navigator.clipboard.writeText(KEY.replace(/ /g, '')); } catch (e) {} }}><Copy className="i" aria-hidden="true" />Copy key</DButton></div>
        </div>
      </div>
      <Text1 label="6-digit code" value={code} onChange={(v) => { setCode(v); setErr(''); }} error={err} inputMode="numeric" autoComplete="one-time-code" />
    </Dlg>
  );
}

function TotpOff({ onClose, onDone }) {
  const [code, setCode] = useState(''); const [err, setErr] = useState('');
  return (
    <Dlg destructive title="Turn off two-step verification" onClose={onClose} submitLabel="Turn off"
      onSubmit={() => { if (!isCode(code)) setErr('Enter the 6-digit code from your app.'); else onDone(); }}>
      <p>Your account will be protected by your password only. Enter a code from your authenticator app to confirm.</p>
      <Text1 label="6-digit code" value={code} onChange={(v) => { setCode(v); setErr(''); }} error={err} inputMode="numeric" autoComplete="one-time-code" />
    </Dlg>
  );
}

function Row({ title, help, action, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border px-6 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-label text-fg-2">{title}</p>
        <div className="flex flex-wrap items-center gap-2 text-fg">{children}</div>
        {help && <p className="mt-1 text-label text-fg-2">{help}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProfileView({ notify }) {
  const [me, setMe] = useState({ first: 'Marie', last: 'Joseph', email: 'marie.joseph@dgpc.gouv.ht', org: 'DGPC Haiti', role: 'Admin', verified: true, totp: false });
  const [dlg, setDlg] = useState(null);
  const close = () => setDlg(null);
  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">Profile</h1>
        <p className="mt-1 text-fg-2">Your details and how you sign in.</p>
      </div>

      <h2 className="t-section pb-2">Your details</h2>
      <section className="card mb-8 overflow-hidden" aria-label="Your details">
        <Row title="Name" action={<DButton variant="secondary" onPress={() => setDlg('name')}>Edit name</DButton>}>{me.first} {me.last}</Row>
        <Row title="Email" help="To change your email address, ask an administrator.">
          {me.email}<Badge tone={me.verified ? 'positive' : 'warning'}>{me.verified ? 'Verified' : 'Not verified'}</Badge>
        </Row>
        <Row title="Organization">{me.org}</Row>
        <Row title="Role" help="Only an administrator can change your role.">{me.role}</Row>
      </section>

      <h2 className="t-section pb-2">Sign in and security</h2>
      <section className="card overflow-hidden" aria-label="Sign in and security">
        <Row title="Password" action={<DButton variant="secondary" onPress={() => setDlg('pw')}>Change password</DButton>}>••••••••••••</Row>
        <Row title="Two-step verification" help="Ask for a code from your authenticator app when you sign in."
          action={me.totp ? <DButton variant="secondary" onPress={() => setDlg('off')}>Turn off</DButton> : <DButton variant="primary" onPress={() => setDlg('on')}>Turn on</DButton>}>
          <Badge tone={me.totp ? 'positive' : 'neutral'}>{me.totp ? 'On' : 'Off'}</Badge>
        </Row>
      </section>
      <div className="h-16" />

      {dlg === 'name' && <NameDialog me={me} onClose={close} onSave={(first, last) => { setMe((m) => ({ ...m, first, last })); notify('Your name was updated.'); close(); }} />}
      {dlg === 'pw' && <PasswordDialog onClose={close} onSave={() => { notify('Your password was changed.'); close(); }} />}
      {dlg === 'on' && <TotpOn onClose={close} onDone={() => { setMe((m) => ({ ...m, totp: true })); notify('Two-step verification is on.'); close(); }} />}
      {dlg === 'off' && <TotpOff onClose={close} onDone={() => { setMe((m) => ({ ...m, totp: false })); notify('Two-step verification is off.'); close(); }} />}
    </>
  );
}

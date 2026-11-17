import React, { useState, useEffect } from 'react';
import {
  Button, SearchField, Input, Table, TableHeader, TableBody, Column, Row, Cell,
  ModalOverlay, Modal, Dialog, Heading, Text, Link, ToggleButtonGroup, ToggleButton,
  UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast, UNSTABLE_ToastContent as ToastContent,
} from 'react-aria-components';
import { Download, Plus, X, Menu as MenuIcon, CircleCheck } from 'lucide-react';
import { DButton, Badge, NavMenu, ClickMenu, SiteTrigger, FilterSelect } from './ui.jsx';
import { FormsView, StatesView, ChartsView } from './views.jsx';
import { LoginView } from '../lib/Login';
import { AccessView } from './access.jsx';
import { ProfileView } from './profile.jsx';
import { OrgsView } from './orgs.jsx';
import { SystemView } from './system.jsx';
import { GeoView } from './geo.jsx';
import { SectorsView } from './sectors.jsx';
import { ApiKeysView } from './apikeys.jsx';
import { AssetsView } from './assets.jsx';
import { DetailView } from '../lib/showcase';

/* Prototype only: menu items that open a built screen. */
const NAV_VIEWS = { ev: 'events', ss: 'system', am: 'access', om: 'orgs', gl: 'geo', sc: 'sectors', ak: 'apikeys', as: 'assets' };

/* ---- Navigation structure (from the current DELTA nav) ---- */
const NAV = [
  { id: 'data', label: 'Data', current: true, items: [
    { id: 'haz', label: 'Hazardous events', desc: 'Monitor hazardous situations' },
    { id: 'ev', label: 'Disaster events', desc: 'View all events', current: true },
    { id: 'rec', label: 'Disaster impact', desc: 'Complete disaster documentations' },
  ] },
  { id: 'analysis', label: 'Analysis', items: [
    { id: 'sec', label: 'Sectors', desc: 'Analyze data by sectors' },
    { id: 'hz', label: 'Hazards', desc: 'Analyze data by hazards' },
    { id: 'evs', label: 'Disaster events', desc: 'Analyze data by disaster events' },
  ] },
  { id: 'about', label: 'About', items: [
    { id: 'sys', label: 'About the system', desc: 'System information' },
    { id: 'tech', label: 'Technical specifications' },
    { id: 'part', label: 'Partners' },
    { id: 'meth', label: 'Methodologies' },
    { id: 'sup', label: 'Support' },
    { id: 'faq', label: 'FAQ' },
  ] },
  { id: 'settings', label: 'Settings', align: 'end', items: [
    { id: 'ss', label: 'System settings', desc: 'Configure system preferences' },
    { id: 'am', label: 'Access management', desc: 'Manage user permissions' },
    { id: 'om', label: 'Organization management', desc: 'Manage organizations' },
    { id: 'gl', label: 'Geographic levels' },
    { id: 'sc', label: 'Sectors' },
    { id: 'ak', label: 'API keys' },
    { id: 'as', label: 'Assets' },
  ] },
];
const USER_MENU = [
  { id: 'profile', label: 'Profile' },
  { id: 'pw', label: 'Change password' },
  { id: 'totp', label: 'TOTP (2FA)' },
  { id: 'sep', separator: true },
  { id: 'out', label: 'Sign out' },
];
const SITES = [
  { id: 'haiti', label: 'DGPC Haiti', desc: 'Official' },
  { id: 'training', label: 'DGPC Haiti Training', desc: 'Training' },
];

const EVENTS = [
  { id: 'EV-2026-0412', name: "Flooding, Grand'Anse", hazard: 'Flood', date: '2026-09-14', people: '48,210', status: 'Pending review' },
  { id: 'EV-2026-0398', name: 'Hurricane landfall, Sud', hazard: 'Hurricane', date: '2026-08-30', people: '162,540', status: 'Validated' },
  { id: 'EV-2026-0377', name: 'Drought, Nord-Ouest', hazard: 'Drought', date: '2026-07-02', people: '73,900', status: 'Draft' },
  { id: 'EV-2026-0351', name: 'Landslide, Ouest', hazard: 'Landslide', date: '2026-06-11', people: '2,340', status: 'Validated' },
  { id: 'EV-2026-0329', name: 'Earthquake aftershock, Sud', hazard: 'Earthquake', date: '2026-05-19', people: '12,075', status: 'Rejected' },
  { id: 'EV-2026-0304', name: 'Flash flood, Artibonite', hazard: 'Flood', date: '2026-04-22', people: '31,880', status: 'Validated' },
  { id: 'EV-2026-0281', name: 'Storm surge, Nippes', hazard: 'Storm surge', date: '2026-03-08', people: '9,415', status: 'Archived' },
];
const TONE = { 'Pending review': 'warning', Validated: 'positive', Draft: 'info', Rejected: 'critical', Archived: 'neutral' };

/* Toast: 4s auto-dismiss, max 3 visible. React Aria Toast is still labelled UNSTABLE in the library. */
const toasts = new ToastQueue({ maxVisibleToasts: 3 });
const notify = (title) => toasts.add({ title }, { timeout: 4000 });

export default function App() {
  const [view, setView] = useState('events');
  const [openNav, setOpenNav] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [site, setSite] = useState('haiti');
  const [hazard, setHazard] = useState('All');
  const [status, setStatus] = useState('All');
  const [events, setEvents] = useState(EVENTS);
  const [target, setTarget] = useState(null);

  const confirm = () => {
    setEvents((list) => list.map((e) => (e.id === target ? { ...e, status: 'Validated' } : e)));
    notify(`Event ${target} validated.`);
    setTarget(null);
  };

  const visible = events.filter((e) =>
    (hazard === 'All' || e.hazard === hazard) && (status === 'All' || e.status === status));

  const proto = (
      <div className="proto" role="group" aria-label="Prototype views">
        <span className="proto-title">View</span>
        <ToggleButtonGroup selectionMode="single" disallowEmptySelection selectedKeys={[view]}
          onSelectionChange={(k) => setView([...k][0])} className="proto-group">
          <ToggleButton id="events" className="proto-btn">Events</ToggleButton>
          <ToggleButton id="forms" className="proto-btn">Forms</ToggleButton>
          <ToggleButton id="states" className="proto-btn">States</ToggleButton>
          <ToggleButton id="charts" className="proto-btn">Charts</ToggleButton>
          <ToggleButton id="detail" className="proto-btn">Event detail</ToggleButton>
          <ToggleButton id="login" className="proto-btn">Log in</ToggleButton>
          <ToggleButton id="reset" className="proto-btn">Reset password</ToggleButton>
          <ToggleButton id="access" className="proto-btn">Access management</ToggleButton>
          <ToggleButton id="system" className="proto-btn">System settings</ToggleButton>
          <ToggleButton id="orgs" className="proto-btn">Organizations</ToggleButton>
          <ToggleButton id="geo" className="proto-btn">Geographic levels</ToggleButton>
          <ToggleButton id="sectors" className="proto-btn">Sectors</ToggleButton>
          <ToggleButton id="apikeys" className="proto-btn">API keys</ToggleButton>
          <ToggleButton id="assets" className="proto-btn">Assets</ToggleButton>
          <ToggleButton id="profile" className="proto-btn">Profile</ToggleButton>
        </ToggleButtonGroup>
      </div>
  );

  if (view === 'login' || view === 'reset') return <div><LoginView initialStep={view === 'reset' ? 'reset' : 'signin'} onSignedIn={() => setView('events')} />{proto}</div>;

  return (
    <div>
      {/* ---- Top nav ---- */}
      <header className="topnav">
        <div className="wrap flex h-12 items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold tracking-wide text-accent" style={{ fontWeight: 'var(--fw-ui)' }}>DELTA</span>
            <span className="hidden md:block h-6 w-px bg-border" aria-hidden="true" />
            <ClickMenu
              trigger={<SiteTrigger name={SITES.find((s) => s.id === site).label} />}
              items={SITES} selectedKey={site} onAction={setSite} />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1" aria-label="Main">
              {NAV.map((n) => (
                <NavMenu key={n.id} {...n} openId={openNav} setOpenId={setOpenNav} onAction={(k) => { const v = NAV_VIEWS[k]; if (v) { setView(v); setOpenNav(null); } }} />
              ))}
            </nav>
            <ClickMenu
              placement="bottom end"
              trigger={<Button className="avatar" aria-label="AH, account menu">AH</Button>}
              items={USER_MENU} />
            <Button className="icon-btn md:hidden" aria-label="Navigation" aria-expanded={mobileOpen}
              onPress={() => setMobileOpen((o) => !o)}>
              {mobileOpen ? <X className="i" aria-hidden="true" /> : <MenuIcon className="i" aria-hidden="true" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="mnav md:hidden absolute left-0 right-0 top-12" aria-label="Main (mobile)">
            {NAV.map((n) => (
              <div key={n.id}>
                <h3 className="t-th">{n.label}</h3>
                {n.items.map((it) => <Link key={it.id} href="#">{it.label}</Link>)}
              </div>
            ))}
          </nav>
        )}
      </header>

      {/* ---- Page ---- */}
      {view !== 'events' ? (
        <main className="wrap">
          {view === 'forms' && <FormsView />}
          {view === 'states' && <StatesView />}
          {view === 'charts' && <ChartsView />}
          {view === 'detail' && <DetailView />}
          {view === 'access' && <AccessView notify={notify} />}
          {view === 'profile' && <ProfileView notify={notify} />}
          {view === 'orgs' && <OrgsView notify={notify} />}
          {view === 'system' && <SystemView notify={notify} />}
          {view === 'geo' && <GeoView notify={notify} />}
          {view === 'sectors' && <SectorsView />}
          {view === 'apikeys' && <ApiKeysView notify={notify} />}
          {view === 'assets' && <AssetsView notify={notify} />}
        </main>
      ) : (
      <main className="wrap">
        <div className="flex flex-wrap items-start justify-between gap-4 pt-8 pb-6">
          <div>
            <h1 className="t-page-title">Disaster events</h1>
            <p className="mt-1 text-fg-2">All recorded events for {SITES.find((s) => s.id === site).label}, 2026.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DButton variant="secondary" onPress={() => notify('Export started. You will be notified when it is ready.')}>
              <Download className="i" aria-hidden="true" />Export
            </DButton>
            <DButton variant="primary" onPress={() => notify('New event form is not part of this example screen.')}>
              <Plus className="i" aria-hidden="true" />New event
            </DButton>
          </div>
        </div>

        <section className="card kpis" aria-label="Summary">
          {[['Events recorded', '128'], ['People affected', '412,380'], ['Pending review', '14'], ['Records complete', '87%']].map(([l, v]) => (
            <div className="kpi" key={l}>
              <span className="t-label text-fg-2">{l}</span>
              <span className="t-data-large">{v}</span>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center gap-2 pt-6 pb-4" role="search">
          <SearchField aria-label="Search events">
            <Input className="input" placeholder="Search by event name or ID" />
          </SearchField>
          <FilterSelect label="Hazard" allLabel="All hazards" value={hazard} onChange={setHazard}
            options={['All', 'Flood', 'Hurricane', 'Earthquake', 'Drought']} />
          <FilterSelect label="Status" allLabel="All statuses" value={status} onChange={setStatus}
            options={['All', 'Validated', 'Pending review', 'Draft', 'Rejected']} />
          <span className="flex-1" />
          <DButton variant="ghost" onPress={() => { setHazard('All'); setStatus('All'); }}>Clear filters</DButton>
        </div>

        <section className="card overflow-hidden" aria-label="Disaster events table">
          <div className="overflow-x-auto">
            <Table aria-label="Disaster events" selectionMode="single" selectionBehavior="replace" className="dtable">
              <TableHeader>
                <Column isRowHeader className="t-th">ID</Column>
                <Column className="t-th">Event</Column>
                <Column className="t-th">Hazard</Column>
                <Column className="t-th">Start date</Column>
                <Column className="t-th num">People affected</Column>
                <Column className="t-th">Status</Column>
                <Column className="t-th"><span className="sr-only">Actions</span></Column>
              </TableHeader>
              <TableBody items={visible} renderEmptyState={() => <div className="p-6 text-fg-2">No events match these filters.</div>}>
                {(e) => (
                  <Row id={e.id}>
                    <Cell className="t-data">{e.id}</Cell>
                    <Cell>{e.name}</Cell>
                    <Cell>{e.hazard}</Cell>
                    <Cell className="tnum">{e.date}</Cell>
                    <Cell className="tnum num">{e.people}</Cell>
                    <Cell><Badge tone={TONE[e.status]}>{e.status}</Badge></Cell>
                    <Cell className="num">
                      {e.status === 'Pending review' && (
                        <DButton variant="link" onPress={() => setTarget(e.id)} aria-label={`Validate ${e.id}`}>Validate</DButton>
                      )}
                    </Cell>
                  </Row>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-fg-2">Showing {visible.length} of 128 events</div>
        </section>
        <div className="h-16" />
      </main>
      )}

      {/* ---- Dialog ---- */}
      <ModalOverlay className="scrim" isOpen={!!target} onOpenChange={(o) => { if (!o) setTarget(null); }} isDismissable>
        <Modal className="modal">
          <Dialog className="modal-dialog">
            {({ close }) => (
              <>
                <div className="modal-head">
                  <Heading slot="title" className="t-section">Validate event</Heading>
                  <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
                </div>
                <div className="modal-body">
                  Validating <strong>{target}</strong> makes it visible in analysis dashboards. You can still edit its records afterwards.
                </div>
                <div className="modal-foot">
                  <DButton variant="secondary" onPress={close}>Cancel</DButton>
                  <DButton variant="primary" onPress={confirm}>Validate event</DButton>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* ---- Toasts ---- */}
      <ToastRegion queue={toasts} className="toasts">
        {({ toast }) => (
          <Toast toast={toast} className="toast">
            <CircleCheck className="i" aria-hidden="true" />
            <ToastContent><Text slot="title">{toast.content.title}</Text></ToastContent>
          </Toast>
        )}
      </ToastRegion>

      {proto}
    </div>
  );
}

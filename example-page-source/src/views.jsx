import { FormsExtra, StatesExtra } from '../lib/showcase';
import React, { useState } from 'react';
import {
  TextField, Label, Input, TextArea, Text, FieldError, Checkbox, CheckboxGroup, RadioGroup, Radio, Switch,
  DatePicker, DateInput, DateSegment, Group, Popover, Dialog, Calendar, CalendarGrid, CalendarCell,
  CalendarGridHeader, CalendarGridBody, CalendarHeaderCell, Heading, Button,
  Select, SelectValue, ListBox, ListBoxItem,
} from 'react-aria-components';
import { Check, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Inbox, SearchX, TriangleAlert, RotateCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import { DButton } from './ui.jsx';

/* ================= FORMS ================= */

function Field({ label, help, error, children }) {
  return (
    <div className="field">
      <Label className="field-label">{label}</Label>
      {children}
      {help && !error && <Text slot="description" className="field-help">{help}</Text>}
      <FieldError className="field-error">{error}</FieldError>
    </div>
  );
}

function FormSelect({ label, items, placeholder = 'Select', isDisabled, defaultSelectedKey }) {
  return (
    <Select className="field" isDisabled={isDisabled} defaultSelectedKey={defaultSelectedKey}>
      <Label className="field-label">{label}</Label>
      <Button className="select-trigger w-full">
        <SelectValue className="sel-value">{({ selectedText }) => selectedText || <span className="text-fg-2">{placeholder}</span>}</SelectValue>
        <ChevronDown className="i chev" aria-hidden="true" />
      </Button>
      <Popover className="pop-card" offset={4}>
        <ListBox className="menu-list" items={items}>
          {(it) => (
            <ListBoxItem id={it} textValue={it} className="menu-item">
              {({ isSelected }) => (<><span className="option-label">{it}</span>{isSelected && <Check className="i" aria-hidden="true" />}</>)}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}

export function FormsView() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">Forms</h1>
        <p className="mt-1 text-fg-2">Form components built on React Aria. Label above, help text below, errors in plain language.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-6 flex flex-col gap-6" aria-label="Record an event">
          <h2 className="t-section">Record an event</h2>
          <TextField className="field" isRequired>
            <Label className="field-label">Event name</Label>
            <Input className="input w-full" placeholder="e.g. Hurricane Laura, Les Cayes" />
            <Text slot="description" className="field-help">Use the name the national authority uses.</Text>
          </TextField>
          <FormSelect label="Hazard" items={['Flood', 'Hurricane', 'Earthquake', 'Drought']} placeholder="Select a hazard" />
          <DatePicker className="field" granularity="day">
            <Label className="field-label">Start date</Label>
            <Group className="input date-group">
              <DateInput className="date-input">{(s) => <DateSegment segment={s} className="date-seg" />}</DateInput>
              <Button className="icon-btn date-btn" aria-label="Open calendar"><CalendarDays className="i" aria-hidden="true" /></Button>
            </Group>
            <Popover className="pop-card" offset={4}>
              <Dialog className="outline-none">
                <Calendar className="cal">
                  <header className="cal-head">
                    <Button slot="previous" className="icon-btn" aria-label="Previous month"><ChevronLeft className="i" aria-hidden="true" /></Button>
                    <Heading className="cal-title" />
                    <Button slot="next" className="icon-btn" aria-label="Next month"><ChevronRight className="i" aria-hidden="true" /></Button>
                  </header>
                  <CalendarGrid className="cal-grid">
                    <CalendarGridHeader>{(d) => <CalendarHeaderCell className="cal-dow">{d}</CalendarHeaderCell>}</CalendarGridHeader>
                    <CalendarGridBody>{(date) => <CalendarCell date={date} className="cal-cell" />}</CalendarGridBody>
                  </CalendarGrid>
                </Calendar>
              </Dialog>
            </Popover>
          </DatePicker>
          <TextField className="field">
            <Label className="field-label">Notes</Label>
            <TextArea className="input textarea" rows={3} placeholder="Optional" />
          </TextField>
          <div className="flex justify-end gap-2">
            <DButton variant="secondary">Cancel</DButton>
            <DButton variant="primary" onPress={() => setSent(true)}>Save event</DButton>
          </div>
          {sent && <p className="field-help" role="status">This is an example. Nothing was saved.</p>}
        </section>

        <section className="card p-6 flex flex-col gap-6" aria-label="Choices">
          <h2 className="t-section">Choices</h2>
          <CheckboxGroup className="field" defaultValue={['deaths']}>
            <Label className="field-label">Include in report</Label>
            <Checkbox value="deaths" className="check"><span className="box"><Check className="i" aria-hidden="true" /></span>Deaths and missing</Checkbox>
            <Checkbox value="housing" className="check"><span className="box"><Check className="i" aria-hidden="true" /></span>Damaged housing</Checkbox>
            <Checkbox value="agri" className="check"><span className="box"><Check className="i" aria-hidden="true" /></span>Agricultural losses</Checkbox>
            <Checkbox value="x" isDisabled className="check"><span className="box"><Check className="i" aria-hidden="true" /></span>Infrastructure (not available)</Checkbox>
          </CheckboxGroup>
          <RadioGroup className="field" defaultValue="all">
            <Label className="field-label">Visibility</Label>
            <Radio value="all" className="check"><span className="dot" />Everyone with access</Radio>
            <Radio value="org" className="check"><span className="dot" />My organization only</Radio>
            <Radio value="me" className="check"><span className="dot" />Only me</Radio>
          </RadioGroup>
          <Switch className="switch" defaultSelected>
            <span className="track"><span className="thumb" /></span>Notify validators when saved
          </Switch>
          <Switch className="switch" isDisabled>
            <span className="track"><span className="thumb" /></span>Publish to public portal (not available)
          </Switch>
        </section>

        <section className="card p-6 flex flex-col gap-6 md:col-span-2" aria-label="Field states">
          <h2 className="t-section">Field states</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <TextField className="field" defaultValue="Hurricane Laura">
              <Label className="field-label">Filled</Label>
              <Input className="input w-full" />
            </TextField>
            <TextField className="field" isInvalid defaultValue="2026-13-45">
              <Label className="field-label">Error</Label>
              <Input className="input w-full" />
              <FieldError className="field-error">Enter a valid date, for example 2026-09-14.</FieldError>
            </TextField>
            <TextField className="field" isDisabled defaultValue="EV-2026-0412">
              <Label className="field-label">Disabled</Label>
              <Input className="input w-full" />
            </TextField>
          </div>
        </section>
        <FormsExtra />
      </div>
      <div className="h-32" />
    </>
  );
}

/* ================= STATES ================= */

function Spinner({ label = 'Loading' }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function StatesView() {
  const [busy, setBusy] = useState(false);
  const save = () => { setBusy(true); setTimeout(() => setBusy(false), 2000); };
  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">States</h1>
        <p className="mt-1 text-fg-2">What users see when there is nothing to show, something is loading, or something went wrong.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card" aria-label="Empty, first use">
          <div className="state">
            <Inbox className="state-icon" aria-hidden="true" />
            <h2 className="t-subsection-sm">No events recorded yet</h2>
            <p className="text-fg-2">Events you record for this site will appear here.</p>
            <DButton variant="primary">New event</DButton>
          </div>
        </section>
        <section className="card" aria-label="Empty, no results">
          <div className="state">
            <SearchX className="state-icon" aria-hidden="true" />
            <h2 className="t-subsection-sm">No events match these filters</h2>
            <p className="text-fg-2">Try a different hazard or status.</p>
            <DButton variant="secondary">Clear filters</DButton>
          </div>
        </section>
        <section className="card" aria-label="Loading table">
          <div className="p-4 flex flex-col gap-3" role="status" aria-busy="true" aria-label="Loading events">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="flex items-center gap-4" key={i}>
                <span className="skel" style={{ width: 96 }} /><span className="skel" style={{ flex: 1 }} /><span className="skel" style={{ width: 64 }} />
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-fg-2">Skeleton rows keep the table layout while data loads</div>
        </section>
        <section className="card" aria-label="Loading actions">
          <div className="state">
            <h2 className="t-subsection-sm">Actions that take time</h2>
            <p className="text-fg-2">The button keeps its width, shows a spinner and cannot be pressed twice.</p>
            <DButton variant="primary" isDisabled={busy} onPress={save}>
              {busy ? <><Spinner label="Saving" />Saving</> : 'Save event'}
            </DButton>
            <div className="flex items-center gap-2 text-fg-2"><Spinner />Loading map data</div>
          </div>
        </section>
        <section className="card md:col-span-2" aria-label="Error">
          <div className="banner" role="alert">
            <TriangleAlert className="i" aria-hidden="true" />
            <div className="flex-1">
              <strong>Events could not be loaded.</strong>
              <span className="text-fg-2"> Check your connection and try again. Your filters are kept.</span>
            </div>
            <DButton variant="secondary"><RotateCw className="i" aria-hidden="true" />Try again</DButton>
          </div>
        </section>
        <StatesExtra />
      </div>
      <div className="h-32" />
    </>
  );
}

/* ================= CHARTS ================= */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const PER_MONTH = [6, 9, 7, 11, 14, 18, 22, 27, 19, 12].map((v, i) => ({ m: MONTHS[i], v }));
const BY_HAZARD = [
  { h: 'Flood', v: 46 }, { h: 'Hurricane', v: 31 }, { h: 'Drought', v: 22 }, { h: 'Earthquake', v: 15 }, { h: 'Landslide', v: 9 },
];
const INK = 'var(--fg-2)';

function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <div className="text-fg-2">{label ?? payload[0].payload.h}</div>
      <div className="tnum">{payload[0].value} {unit}</div>
    </div>
  );
}

function ChartCard({ title, caption, rows, cols, children }) {
  const [table, setTable] = useState(false);
  return (
    <section className="card p-6 flex flex-col gap-4" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="t-section">{title}</h2>
          <p className="text-fg-2">{caption}</p>
        </div>
        <DButton variant="ghost" onPress={() => setTable((t) => !t)}>{table ? 'Show chart' : 'Show as table'}</DButton>
      </div>
      {table ? (
        <table className="mini-table">
          <thead><tr>{cols.map((c) => <th key={c} className="t-th">{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j ? 'tnum' : ''}>{c}</td>)}</tr>)}</tbody>
        </table>
      ) : children}
    </section>
  );
}

export function ChartsView() {
  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">Charts</h1>
        <p className="mt-1 text-fg-2">Recharts (MIT licence) styled with DELTA tokens. One hue for one measure, a table view for every chart.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Events per month" caption="Disaster events recorded, 2026"
          cols={['Month', 'Events']} rows={PER_MONTH.map((d) => [d.m, d.v])}>
          <div style={{ height: 260 }} role="img" aria-label="Line chart of disaster events recorded per month in 2026, peaking at 27 in August">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PER_MONTH} margin={{ top: 8, right: 16, bottom: 0, left: -16 }} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: INK, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: INK, fontSize: 12 }} width={44} />
                <Tooltip content={<ChartTip unit="events" />} cursor={{ stroke: 'var(--border-strong)' }} />
                <Line type="linear" isAnimationActive={false} dataKey="v" stroke="var(--accent)" strokeWidth={2} dot={false}
                  activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Events by hazard" caption="Share of events recorded, 2026"
          cols={['Hazard', 'Events']} rows={BY_HAZARD.map((d) => [d.h, d.v])}>
          <div style={{ height: 260 }} role="img" aria-label="Bar chart of events by hazard: flood 46, hurricane 31, drought 22, earthquake 15, landslide 9">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BY_HAZARD} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 8 }} accessibilityLayer>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="h" tickLine={false} axisLine={false} width={84} tick={{ fill: 'var(--fg)', fontSize: 14 }} />
                <Tooltip content={<ChartTip unit="events" />} cursor={{ fill: 'var(--inset)' }} />
                <Bar dataKey="v" isAnimationActive={false} fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={14}>
                  <LabelList dataKey="v" position="right" fill="var(--fg-2)" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <section className="card p-6 mt-4 flex flex-col gap-4" aria-label="Colour roles">
        <h2 className="t-section">Colour roles</h2>
        <div className="grid gap-6 md:grid-cols-3 text-fg-2">
          <div><div className="swatches">{['#2D6FA3', '#eb6834', '#1baf7a'].map((c) => <span key={c} style={{ background: c }} />)}</div>
            <p className="mt-2"><strong className="text-fg">Categories</strong><br />Fixed order, 3 maximum when colour must tell series apart. Checked for colour blindness.</p></div>
          <div><div className="swatches">{['#cde2fb', '#86b6ef', '#3987e5', '#256abf', '#104281'].map((c) => <span key={c} style={{ background: c }} />)}</div>
            <p className="mt-2"><strong className="text-fg">Magnitude</strong><br />One hue, light to dark. For maps and heatmaps.</p></div>
          <div><div className="swatches">{['#146B40', '#A85C00', '#C8352A'].map((c) => <span key={c} style={{ background: c }} />)}</div>
            <p className="mt-2"><strong className="text-fg">Status</strong><br />Reserved for good, warning, critical. Always with a label.</p></div>
        </div>
      </section>
      <div className="h-32" />
    </>
  );
}

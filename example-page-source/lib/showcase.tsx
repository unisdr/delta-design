import { useState } from 'react';
import {
  TextArea, PasswordField, MaskedField, Tags, MultiSelect, FileUpload, MessageBanner, Tooltip,
  Breadcrumbs, Accordion, Listbox, Tree, TreeSelect, ListView, SegmentedButton, Stepper, Avatar, Divider, DButton,
  type TreeNode,
} from './index';

const hazards: TreeNode[] = [
  { id: 'hydro', label: 'Hydrological', children: [{ id: 'coastal', label: 'Flood - coastal' }, { id: 'river', label: 'Flood - river' }] },
  { id: 'geo', label: 'Geological', children: [{ id: 'quake', label: 'Earthquake' }, { id: 'slide', label: 'Landslide' }] },
  { id: 'meteo', label: 'Meteorological', children: [{ id: 'storm', label: 'Storm' }] },
];

export function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-lg border border-border-subtle bg-surface p-6" aria-label={title}>
      <h2 className="text-section font-medium text-fg">{title}</h2>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

export function FormsExtra() {
  const [tags, setTags] = useState([{ id: 'flood', name: 'Flood' }, { id: 'drought', name: 'Drought' }]);
  return (
    <>
      <Block title="Text area, password, input mask">
        <TextArea label="Description" placeholder="Add a description" help="Describe what happened in plain language." />
        <PasswordField label="Password" placeholder="Enter your password" />
        <MaskedField label="Event date" mask="####-##-##" help="Year, month, day" />
        <TextArea label="Notes" error="Enter at least 10 characters." isInvalid />
        <TextArea label="Event ID" isDisabled defaultValue="EV-2026-0412" />
      </Block>
      <Block title="Tag, multi-select, tree select">
        <Tags label="Hazards" items={tags} onRemove={(keys) => setTags((t) => t.filter((x) => !keys.has(x.id)))} />
        <Tags label="Read-only tags" items={[{ id: 'a', name: 'Validated' }]} />
        <div className="w-[240px]"><MultiSelect label="Hazards" options={['Flood', 'Drought', 'Earthquake', 'Landslide']} noun="hazards selected" placeholder="All hazards" /></div>
        <TreeSelect label="Hazard type" nodes={hazards} placeholder="Select a hazard" />
      </Block>
      <Block title="File upload">
        <FileUpload hint="CSV or XLSX, up to 20 MB" />
        <FileUpload hint="CSV or XLSX, up to 20 MB" isDisabled />
      </Block>
      <Block title="Stepper, listbox, tooltip">
        <Stepper label="Progress" steps={['Event details', 'Impact data', 'Review']} current={1} />
        <Listbox label="Hazard" options={['Flood', 'Drought', 'Earthquake', 'Landslide']} />
        <div className="self-start"><Tooltip text="Export as CSV"><DButton>Export</DButton></Tooltip></div>
      </Block>
    </>
  );
}

export function StatesExtra() {
  return (
    <Block title="Message banner">
      <MessageBanner tone="info" title="Information">Imports run overnight. You will see results tomorrow morning.</MessageBanner>
      <MessageBanner tone="success" title="Import complete">48 events were added to the register.</MessageBanner>
      <MessageBanner tone="warning" title="Some values are missing">Fill in the date to submit this record.</MessageBanner>
      <MessageBanner tone="error" title="Events could not be loaded">Check your connection and try again.</MessageBanner>
    </Block>
  );
}

export function DetailView() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 pt-8">
        <Breadcrumbs items={[{ id: 'home', label: 'Home', href: '#' }, { id: 'ev', label: 'Disaster events', href: '#' }, { id: 'cur', label: 'EV-2026-0412' }]} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name="Anders Hansen" />
            <div>
              <h1 className="text-page font-medium text-fg">Hurricane Laura</h1>
              <p className="text-body text-fg-2">EV-2026-0412 - Philippines - recorded by Anders Hansen</p>
            </div>
          </div>
          <SegmentedButton label="View" options={[{ id: 'table', label: 'Details' }, { id: 'chart', label: 'Records' }, { id: 'map', label: 'Map' }]} />
        </div>
        <Divider />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Block title="About this event">
          <Accordion items={[
            { id: 'a', title: 'What counts as a disaster event?', body: 'Any hazardous occurrence that caused loss or damage and is recorded under the national definition.' },
            { id: 'b', title: 'Who can validate an event?', body: 'Users with the validator role for the site.' },
            { id: 'c', title: 'Sources', body: 'National disaster management authority situation reports.' },
          ]} />
        </Block>
        <Block title="Hazard classification">
          <Tree label="Hazard types" nodes={hazards} defaultExpandedKeys={['meteo']} />
        </Block>
        <div className="lg:col-span-2">
          <Block title="Related records">
            <ListView label="Related records" items={[
              { id: '1', title: 'Damage assessment - Leyte', detail: 'REC-0412-01 - Validated - 16 Sep 2026' },
              { id: '2', title: 'Human effects - Eastern Visayas', detail: 'REC-0412-02 - Pending review - 18 Sep 2026' },
              { id: '3', title: 'Infrastructure losses - Samar', detail: 'REC-0412-03 - Draft - 21 Sep 2026' },
            ]} />
          </Block>
        </div>
      </div>
    </div>
  );
}

export function ComponentsView() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="pt-8">
        <h1 className="text-page font-medium text-fg">DELTA components, added 2026-11-10</h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <FormsExtra /><StatesExtra />
      </div>
    </div>
  );
}

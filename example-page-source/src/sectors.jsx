import React, { useMemo, useState } from 'react';
import { SearchField, Input } from 'react-aria-components';
import { DButton } from './ui.jsx';
import { TreeList, allIds, filterTree } from './kit.jsx';

const LEVELS = ['Type', 'Sector', 'Sub-sector', 'Category'];
let n = 0;
const S = (name, description, children) => ({ id: `s${++n}`, name, description, children });
const SECTORS = [
  S('Social', 'Services and assets that support people\'s living conditions.', [
    S('Housing', 'Dwellings and household goods.', [S('Urban housing', 'Dwellings in towns and cities.'), S('Rural housing', 'Dwellings outside towns and cities.')]),
    S('Education', 'Schools, universities and training centres.', [S('Pre-primary and primary', 'Education up to the end of primary school.'), S('Secondary', 'Lower and upper secondary education.'), S('Tertiary and vocational', 'Universities and vocational training.')]),
    S('Health', 'Hospitals, health centres and public health services.', [S('Hospitals', 'Facilities with inpatient care.'), S('Primary health care', 'Health centres, clinics and dispensaries.')]),
    S('Culture', 'Heritage sites, museums, libraries and cultural practice.'),
  ]),
  S('Productive', 'Sectors that produce goods and services for sale.', [
    S('Agriculture', 'Crops, livestock, fisheries and forestry.', [
      S('Crops', 'Annual and permanent crops.', [S('Cereals', 'Maize, rice, sorghum and other cereals.'), S('Roots and tubers', 'Cassava, yam, sweet potato and other roots.'), S('Fruit and vegetables', 'Fruit trees and vegetable growing.')]),
      S('Livestock', 'Cattle, goats, pigs, poultry and their housing.'),
      S('Fisheries and aquaculture', 'Fishing boats, gear, landing sites and fish farms.'),
      S('Forestry', 'Natural and planted forest.'),
    ]),
    S('Industry', 'Manufacturing, mining and construction.'),
    S('Commerce', 'Wholesale and retail trade, markets.'),
    S('Tourism', 'Hotels, restaurants and tourist sites.'),
  ]),
  S('Infrastructure', 'Networks and facilities that other sectors depend on.', [
    S('Transport', 'Roads, bridges, ports and airports.', [S('Roads and bridges', 'National, departmental and local roads.'), S('Ports', 'Sea ports and landing stages.'), S('Airports', 'Runways and terminals.')]),
    S('Energy', 'Electricity generation, transmission and distribution, and fuel supply.'),
    S('Water and sanitation', 'Water supply, sewerage and solid waste.', [S('Water supply', 'Treatment plants, networks and wells.'), S('Sanitation', 'Sewerage, latrines and waste.')]),
    S('Telecommunications', 'Mobile, fixed and broadcast networks.'),
  ]),
  S('Cross-cutting', 'Themes that cut across the other sectors.', [
    S('Environment', 'Ecosystems, protected areas and environmental services.'),
    S('Governance', 'Public administration buildings and services.'),
    S('Disaster risk reduction', 'Early warning systems, shelters and emergency services.'),
  ]),
];
const count = (nodes) => nodes.reduce((t, x) => t + 1 + count(x.children || []), 0);

export function SectorsView() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(new Set(SECTORS.map((s) => s.id)));
  const nodes = useMemo(() => filterTree(SECTORS, q), [q]);
  const expanded = q.trim() ? new Set(allIds(nodes)) : open;
  const total = count(nodes);

  return (
    <>
      <div className="pt-8 pb-6">
        <h1 className="t-page-title">Sectors</h1>
        <p className="mt-1 text-fg-2">The sectors used to classify losses and damages. The list is the same for every country and cannot be changed here.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4">
        <SearchField style={{ width: 340, maxWidth: '100%' }} aria-label="Search sectors" value={q} onChange={setQ}>
          <Input className="input w-full" placeholder="Search sectors" />
        </SearchField>
        <span className="ml-auto flex gap-2">
          <DButton variant="ghost" isDisabled={!!q.trim()} onPress={() => setOpen(new Set(allIds(SECTORS)))}>Expand all</DButton>
          <DButton variant="ghost" isDisabled={!!q.trim()} onPress={() => setOpen(new Set())}>Collapse all</DButton>
        </span>
      </div>

      <section className="card overflow-hidden" aria-label="Sectors">
        <div className="tl-head" aria-hidden="true">
          <span className="min-w-0 flex-1">Name</span>
          <span className="tl-col w-[96px]">Level</span>
          <span className="tl-col hidden w-[440px] lg:block">Description</span>
        </div>
        <TreeList label="Sectors" nodes={nodes} expanded={expanded} onExpandedChange={(k) => { if (!q.trim()) setOpen(new Set(k)); }}
          empty={`No sectors match "${q}".`}
          renderMain={(s, level) => (
            <>
              <span className="min-w-0 flex-1 truncate text-fg" title={s.name}>{s.name}</span>
              <span className="tl-col w-[96px]">{LEVELS[level - 1]}</span>
              <span className="tl-col hidden w-[440px] lg:block" title={s.description}>{s.description}</span>
            </>
          )} />
        <div className="border-t border-border px-4 py-3 text-fg-2">{total} {total === 1 ? 'sector' : 'sectors'}{q.trim() ? ' match your search' : ''}</div>
      </section>
      <div className="h-16" />
    </>
  );
}

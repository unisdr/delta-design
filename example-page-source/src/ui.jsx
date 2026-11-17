import React, { useEffect, useRef } from 'react';
import {
  Button, MenuTrigger, Menu, MenuItem, Popover, Select, SelectValue, ListBox, ListBoxItem, Separator,
} from 'react-aria-components';
import { ChevronDown, ChevronsUpDown, Check, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Label as RACLabel } from 'react-aria-components';
import { Column as RACColumn } from 'react-aria-components';

const cx = (...a) => a.filter(Boolean).join(' ');

/* Button: 32px, 14px. Variants: primary, secondary, ghost, link. */
export function DButton({ variant = 'secondary', className, ...props }) {
  return <Button {...props} className={cx('btn', `btn-${variant}`, className)} />;
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/* Shared menu content. Items: { id, label, desc?, current?, separator? } */
function MenuBody({ items, selectedKey, onAction }) {
  return (
    <Menu className="menu-list" aria-label="Menu" onAction={onAction}
      selectionMode={selectedKey !== undefined ? 'single' : 'none'}
      selectedKeys={selectedKey !== undefined ? [selectedKey] : undefined}>
      {items.map((it) =>
        it.separator ? (
          <Separator key={it.id} className="menu-sep" />
        ) : (
          <MenuItem key={it.id} id={it.id} textValue={it.label} className="menu-item" data-current={it.current ? '' : undefined}>
            <span>
              <span className="menu-label">{it.label}</span>
              {it.desc && <span className="menu-desc">{it.desc}</span>}
            </span>
            {selectedKey !== undefined && it.id === selectedKey && <Check className="i" aria-hidden="true" />}
          </MenuItem>
        ),
      )}
    </Menu>
  );
}

/* Top nav item. Opens on hover (mouse), press, or keyboard. Production wrapper around MenuTrigger (controlled isOpen). */
export function NavMenu({ id, label, current, items, openId, setOpenId, align = 'start', onAction }) {
  const open = openId === id;
  const timers = useRef({});
  const hoverOpened = useRef(false);
  const pressing = useRef(false);
  const host = useRef(null);

  const clear = () => { clearTimeout(timers.current.o); clearTimeout(timers.current.c); };
  const enter = (e) => {
    if (e.pointerType !== 'mouse') return;
    clear();
    timers.current.o = setTimeout(() => { hoverOpened.current = true; setOpenId(id); }, 80);
  };
  const leave = (e) => {
    if (e.pointerType !== 'mouse') return;
    clear();
    timers.current.c = setTimeout(() => setOpenId((cur) => (cur === id ? null : cur)), 200);
  };
  const onOpenChange = (next) => {
    // A mouse press on a trigger that hover already opened keeps it open.
    if (!next && pressing.current && hoverOpened.current) return;
    if (!next) hoverOpened.current = false;
    setOpenId(next ? id : (cur) => (cur === id ? null : cur));
  };

  // Close on press outside (non-modal popover has no underlay).
  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (host.current && host.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-nav-pop]')) return;
      setOpenId((cur) => (cur === id ? null : cur));
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [open, id, setOpenId]);

  return (
    <div ref={host} className="relative flex" onPointerEnter={enter} onPointerLeave={leave}
      onPointerDownCapture={() => { pressing.current = true; setTimeout(() => { pressing.current = false; }, 0); }}>
      <MenuTrigger isOpen={open} onOpenChange={onOpenChange}>
        <Button className="nav-trigger" data-current={current ? '' : undefined}>
          {label}
          <ChevronDown className="i chev" aria-hidden="true" />
        </Button>
        <Popover className="pop" placement={align === 'end' ? 'bottom end' : 'bottom start'} offset={0} isNonModal>
          <div className="pop-gap" data-nav-pop>
            <div className="pop-card"><MenuBody items={items} onAction={onAction} /></div>
          </div>
        </Popover>
      </MenuTrigger>
    </div>
  );
}

/* Click-only menu: site switcher and account menu. */
export function ClickMenu({ trigger, items, selectedKey, onAction, placement = 'bottom start' }) {
  return (
    <MenuTrigger>
      {trigger}
      <Popover className="pop" placement={placement} offset={4}>
        <div className="pop-card"><MenuBody items={items} selectedKey={selectedKey} onAction={onAction} /></div>
      </Popover>
    </MenuTrigger>
  );
}

export function SiteTrigger({ name }) {
  return (
    <Button className="site-btn" aria-label={`Site ${name}, switch site`}>
      <span>
        <span className="t-overline hidden md:block text-fg-2">Site</span>{' '}
        <span className="block" style={{ fontWeight: 'var(--fw-ui)', lineHeight: 1.25 }}>{name}</span>
      </span>
      <ChevronsUpDown className="i chev text-fg-2" aria-hidden="true" />
    </Button>
  );
}

/* Filter select: trigger shows only the value ("All hazards" / "Flood"); the field name is the aria-label.
   A non-default value tints the trigger. Listbox: selected = check, no fill. */
export function FilterSelect({ label, allLabel, options, value, onChange }) {
  const text = (o) => (o === 'All' ? allLabel : o);
  return (
    <Select aria-label={label} selectedKey={value} onSelectionChange={onChange}>
      <Button className="select-trigger" data-active={value !== 'All' ? '' : undefined}>
        <SelectValue className="sel-value">{({ selectedText }) => selectedText}</SelectValue>
        <ChevronDown className="i chev" aria-hidden="true" />
      </Button>
      <Popover className="pop" offset={4}>
        <div className="pop-card" style={{ minWidth: 'var(--trigger-width)' }}>
          <ListBox className="menu-list" aria-label={label}>
            {options.map((o) => (
              <ListBoxItem key={o} id={o} textValue={text(o)} className="menu-item">
                {({ isSelected }) => (
                  <>
                    <span className="option-label">{text(o)}</span>
                    {isSelected && <Check className="i" aria-hidden="true" />}
                  </>
                )}
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      </Popover>
    </Select>
  );
}

/* Sortable column header: click to sort, click again to reverse. Arrow shows the sorted column and direction. */
export function SortColumn({ id, children, ...props }) {
  return (
    <RACColumn id={id} allowsSorting className="t-th t-th-sort" {...props}>
      {({ sortDirection }) => (
        <span className="inline-flex items-center gap-1">
          {children}
          {sortDirection === 'ascending' ? <ArrowUp className="i-sm" aria-hidden="true" />
            : sortDirection === 'descending' ? <ArrowDown className="i-sm" aria-hidden="true" />
            : <ChevronsUpDown className="i-sm sort-idle" aria-hidden="true" />}
        </span>
      )}
    </RACColumn>
  );
}
export function sortRows(rows, d, get) {
  if (!d) return rows;
  const dir = d.direction === 'descending' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = get(a, d.column), y = get(b, d.column);
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
  });
}

/* Table footer: range text, rows per page, previous and next. */
export const PAGE_SIZES = [25, 50, 100];
export function Pagination({ total, page, pageSize, onPage, onPageSize, noun }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(page, pages);
  const from = total ? (p - 1) * pageSize + 1 : 0;
  const to = Math.min(p * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border px-4 py-3 text-fg-2">
      <span>Showing {from}-{to} of {total} {noun}</span>
      <span className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Select selectedKey={pageSize} onSelectionChange={(k) => onPageSize(Number(k))} className="flex items-center gap-2">
          <RACLabel>Rows per page</RACLabel>
          <Button className="select-trigger" style={{ minWidth: 72 }}>
            <SelectValue className="sel-value tnum" />
            <ChevronDown className="i chev" aria-hidden="true" />
          </Button>
          <Popover className="pop" offset={4}>
            <div className="pop-card" style={{ minWidth: 'var(--trigger-width)' }}>
              <ListBox className="menu-list">
                {PAGE_SIZES.map((n) => (
                  <ListBoxItem key={n} id={n} textValue={String(n)} className="menu-item">
                    {({ isSelected }) => (<><span className="option-label tnum">{n}</span>{isSelected && <Check className="i" aria-hidden="true" />}</>)}
                  </ListBoxItem>
                ))}
              </ListBox>
            </div>
          </Popover>
        </Select>
        <span className="flex items-center gap-2">
          <Button className="icon-btn" aria-label="Previous page" isDisabled={p <= 1} onPress={() => onPage(p - 1)}><ChevronLeft className="i" aria-hidden="true" /></Button>
          <span>Page {p} of {pages}</span>
          <Button className="icon-btn" aria-label="Next page" isDisabled={p >= pages} onPress={() => onPage(p + 1)}><ChevronRight className="i" aria-hidden="true" /></Button>
        </span>
      </span>
    </div>
  );
}

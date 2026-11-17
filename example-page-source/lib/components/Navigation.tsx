import { useState, type ReactNode } from 'react';
import {
  Breadcrumbs as RACBreadcrumbs, Breadcrumb, Link, DisclosureGroup, Disclosure, DisclosurePanel, Heading,
  ListBox, ListBoxItem, Tree as RACTree, TreeItem, TreeItemContent, GridList, GridListItem,
  ToggleButtonGroup, ToggleButton, Separator, Button, DialogTrigger, Popover, Dialog,
  type Key,
} from 'react-aria-components';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cx, fast, controlBase } from './shared';

/* Breadcrumbs: accent links, chevron separators, current page in medium weight and not a link. */
export function Breadcrumbs({ items }: { items: { id: string; label: string; href?: string }[] }) {
  return (
    <RACBreadcrumbs className="flex items-center gap-2 text-body">
      {items.map((it) => (
        <Breadcrumb key={it.id} id={it.id} className="flex items-center gap-2">
          <Link href={it.href} className={cx('outline-none data-[current]:font-medium data-[current]:text-fg data-[current]:cursor-default text-accent', fast, 'data-[hovered]:underline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-[var(--focus-ring)]')}>
            {it.label}
          </Link>
          <ChevronRight className="size-4 text-fg-2 [li:last-child_&]:hidden" aria-hidden="true" />
        </Breadcrumb>
      ))}
    </RACBreadcrumbs>
  );
}

/* Accordion: 48px header, chevron turns 180 degrees when open, 1px subtle divider. Height animates with the motion token. */
export function Accordion({ items, allowsMultipleExpanded }: { items: { id: string; title: string; body: ReactNode }[]; allowsMultipleExpanded?: boolean }) {
  return (
    <DisclosureGroup allowsMultipleExpanded={allowsMultipleExpanded} className="w-full">
      {items.map((it) => (
        <Disclosure key={it.id} id={it.id} className="group border-b border-border-subtle">
          <Heading>
            <Button slot="trigger" className={cx('flex h-12 w-full items-center justify-between gap-3 text-left text-body font-medium text-fg outline-none', fast, 'data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-[var(--focus-ring)]')}>
              {it.title}
              <ChevronDown className="size-4 text-fg-2 transition-transform duration-[var(--dur-normal)] ease-[var(--ease)] group-data-[expanded]:rotate-180" aria-hidden="true" />
            </Button>
          </Heading>
          <DisclosurePanel className="h-[var(--disclosure-panel-height)] overflow-clip transition-[height] duration-[var(--dur-normal)] ease-[var(--ease)]">
            <div className="pb-4 text-body text-fg-2">{it.body}</div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}

/* Listbox: bordered, 32px items like menus, check on selected. */
export function Listbox({ label, options, selectionMode = 'single', value, onChange }:
  { label: string; options: string[]; selectionMode?: 'single' | 'multiple'; value?: Key[]; onChange?: (k: Key[]) => void }) {
  return (
    <ListBox aria-label={label} selectionMode={selectionMode} selectedKeys={value} onSelectionChange={(k) => onChange?.(k === 'all' ? options : Array.from(k))}
      className="w-full rounded-md border border-control bg-surface p-1 outline-none">
      {options.map((o) => (
        <ListBoxItem key={o} id={o} textValue={o}
          className={cx('flex h-8 items-center justify-between gap-2 rounded-md px-3 text-body outline-none cursor-default', fast, 'data-[hovered]:bg-inset data-[focus-visible]:bg-inset')}>
          {({ isSelected }) => (<><span>{o}</span>{isSelected && <Check className="size-4" aria-hidden="true" />}</>)}
        </ListBoxItem>
      ))}
    </ListBox>
  );
}

/* Tree: 32px rows, 16px indent per level, chevron per branch, selected = accent-100 with accent text. */
export type TreeNode = { id: string; label: string; children?: TreeNode[] };

function findNode(ns: TreeNode[], id: Key): TreeNode | undefined {
  for (const n of ns) { if (n.id === id) return n; const c = n.children && findNode(n.children, id); if (c) return c; }
  return undefined;
}

function Node({ n }: { n: TreeNode }) {
  return (
    <TreeItem id={n.id} textValue={n.label}
      className={cx('group flex h-8 items-center rounded-md text-body text-fg outline-none cursor-default', fast, 'data-[hovered]:bg-inset data-[selected]:bg-accent-100 data-[selected]:text-accent data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-[var(--focus-ring)]')}>
      <TreeItemContent>
        {({ hasChildItems, isExpanded, level }) => (
          <div className="flex h-8 w-full items-center gap-2 pr-2" style={{ paddingInlineStart: 8 + (level - 1) * 16 }}>
            {hasChildItems ? (
              <Button slot="chevron" className="inline-flex size-4 items-center justify-center text-fg-2 outline-none">
                <ChevronRight className={cx('size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease)]', isExpanded && 'rotate-90')} aria-hidden="true" />
              </Button>
            ) : <span className="size-4" aria-hidden="true" />}
            <span className="truncate">{n.label}</span>
          </div>
        )}
      </TreeItemContent>
      {n.children?.map((c) => <Node key={c.id} n={c} />)}
    </TreeItem>
  );
}

export function Tree({ label, nodes, defaultExpandedKeys, selectedKeys, onSelectionChange }:
  { label: string; nodes: TreeNode[]; defaultExpandedKeys?: Key[]; selectedKeys?: Key[]; onSelectionChange?: (k: Key[]) => void }) {
  return (
    <RACTree aria-label={label} selectionMode="single" defaultExpandedKeys={defaultExpandedKeys} selectedKeys={selectedKeys}
      onSelectionChange={(k) => onSelectionChange?.(k === 'all' ? [] : Array.from(k))}
      className="w-full rounded-md border border-control bg-surface p-1 outline-none">
      {nodes.map((n) => <Node key={n.id} n={n} />)}
    </RACTree>
  );
}

/* Tree select: a select trigger that opens a tree in a popover. Composed, React Aria has no tree select. */
export function TreeSelect({ label, nodes, placeholder = 'Select', value, onChange }:
  { label: string; nodes: TreeNode[]; placeholder?: string; value?: Key | null; onChange?: (k: Key) => void }) {
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState<Key | null>(null);
  const v = value === undefined ? inner : value;
  const current = v == null ? undefined : findNode(nodes, v);
  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button aria-label={`${label}: ${current ? current.label : placeholder}`} className={cx(controlBase, 'flex h-8 w-full items-center justify-between gap-2 text-left data-[pressed]:bg-inset')}>
        <span className={cx('truncate', !current && 'text-fg-2')}>{current ? current.label : placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-fg-2" aria-hidden="true" />
      </Button>
      <Popover offset={4} className="rounded-xl border border-border bg-surface p-2 shadow-md data-[entering]:opacity-0 data-[exiting]:opacity-0 transition-opacity duration-[var(--dur-normal)] ease-[var(--ease)]">
        <Dialog aria-label={label} className="outline-none">
          <RACTree aria-label={label} selectionMode="single" defaultExpandedKeys={nodes.map((n) => n.id)} selectedKeys={v == null ? [] : [v]}
            onSelectionChange={(k) => {
              const key = k === 'all' ? undefined : Array.from(k)[0];
              if (key === undefined) return;
              const n = findNode(nodes, key);
              if (n && n.children?.length) return; // only leaves can be chosen
              setInner(key); onChange?.(key); setOpen(false);
            }}
            className="max-h-[320px] w-[var(--trigger-width)] overflow-auto outline-none">
            {nodes.map((n) => <Node key={n.id} n={n} />)}
          </RACTree>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

/* List item (replaces PrimeReact DataView): 56px rows, bold title, 11px detail, chevron, hover inset at 55%. */
export function ListView({ label, items, onAction }: { label: string; items: { id: string; title: string; detail: string }[]; onAction?: (id: Key) => void }) {
  return (
    <GridList aria-label={label} onAction={onAction} className="w-full overflow-hidden rounded-lg border border-border bg-surface outline-none">
      {items.map((it) => (
        <GridListItem key={it.id} id={it.id} textValue={it.title}
          className={cx('flex h-[56px] items-center gap-3 border-b border-border-subtle px-4 outline-none cursor-default last:border-b-0', fast, 'data-[hovered]:bg-inset/55 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-[var(--focus-ring)]')}>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body font-medium text-fg">{it.title}</span>
            <span className="truncate text-caption text-fg-2">{it.detail}</span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-fg-2" aria-hidden="true" />
        </GridListItem>
      ))}
    </GridList>
  );
}

/* Segmented button: joined 32px segments, selected = inset fill. For switching views of the same data. */
export function SegmentedButton({ label, options, value, onChange }: { label: string; options: { id: string; label: string; isDisabled?: boolean }[]; value?: Key; onChange?: (k: Key) => void }) {
  const [inner, setInner] = useState<Key>(options[0].id);
  const v = value ?? inner;
  return (
    <ToggleButtonGroup aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={[v]}
      onSelectionChange={(k) => { const key = Array.from(k)[0]; if (key !== undefined) { setInner(key); onChange?.(key); } }}
      className="inline-flex overflow-hidden rounded-md border border-control bg-surface">
      {options.map((o) => (
        <ToggleButton key={o.id} id={o.id} isDisabled={o.isDisabled}
          className={cx('h-8 px-3 pb-[2px] text-body outline-none cursor-default text-fg', fast, 'data-[hovered]:bg-inset/55 data-[selected]:bg-inset data-[disabled]:text-fg-3 data-[disabled]:cursor-not-allowed data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[-2px] data-[focus-visible]:outline-[var(--focus-ring)]')}>
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/* Stepper: React Aria has none, so it is built from basic elements. current is the 0-based index of the current step. */
export function Stepper({ label, steps, current }: { label: string; steps: string[]; current: number }) {
  return (
    <ol aria-label={label} className="flex items-center gap-3">
      {steps.map((s, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        return (
          <li key={s} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className={cx(
                'flex size-6 items-center justify-center rounded-full text-label',
                state === 'complete' && 'bg-accent text-fg-inverse',
                state === 'current' && 'border-2 border-accent bg-surface font-medium text-accent',
                state === 'upcoming' && 'border border-control bg-surface text-fg-2',
              )}>
                {state === 'complete' ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={cx('text-body', state === 'current' ? 'font-medium text-fg' : state === 'upcoming' ? 'text-fg-2' : 'text-fg')}>
                {s}<span className="sr-only">{state === 'complete' ? ' (completed)' : state === 'upcoming' ? ' (not started)' : ' (current step)'}</span>
              </span>
            </span>
            {i < steps.length - 1 && <span aria-hidden="true" className={cx('h-px w-12', i < current ? 'bg-accent' : 'bg-border')} />}
          </li>
        );
      })}
    </ol>
  );
}

/* Avatar: 28px circle (32px large), inset fill, initials. */
export function Avatar({ name, size = 'default' }: { name: string; size?: 'default' | 'large' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
  return (
    <span role="img" aria-label={name} className={cx('inline-flex items-center justify-center rounded-full bg-inset text-label font-medium text-fg-2', size === 'large' ? 'size-8' : 'size-[28px]')}>
      {initials}
    </span>
  );
}

/* Divider: 1px, default border colour. */
export function Divider({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
  return <Separator orientation={orientation} className={orientation === 'vertical' ? 'w-px self-stretch border-0 bg-border' : 'h-px w-full border-0 bg-border'} />;
}

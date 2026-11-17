import { useState, type ReactNode } from 'react';
import {
  TextField, TextArea as RACTextArea, Input, Label, Text, FieldError, Group, Button,
  TagGroup, TagList, Tag as RACTag, Select, SelectValue, Popover, ListBox, ListBoxItem,
  DropZone, FileTrigger, Tooltip as RACTooltip, TooltipTrigger,
  type TextFieldProps, type Key,
} from 'react-aria-components';
import { Eye, EyeOff, X, Check, ChevronDown, Upload, Info, TriangleAlert } from 'lucide-react';
import { cx, fast, controlBase, fieldWrap, labelClass, helpClass, errorClass, DButton } from './shared';

type FieldProps = Omit<TextFieldProps, 'children'> & { label: string; help?: string; error?: string; placeholder?: string };

/* Text area: as input, 80px minimum height, 8px top padding, resizes vertically only. */
export function TextArea({ label, help, error, placeholder, ...props }: FieldProps) {
  return (
    <TextField {...props} isInvalid={props.isInvalid || !!error} className={cx(fieldWrap, props.className as string)}>
      <Label className={labelClass}>{label}</Label>
      <RACTextArea placeholder={placeholder} className={cx(controlBase, 'min-h-[80px] resize-y py-2')} />
      {help && !error && <Text slot="description" className={helpClass}>{help}</Text>}
      {error && <FieldError className={errorClass}>{error}</FieldError>}
    </TextField>
  );
}

/* Password field: input with a show/hide button. The button has an accessible label. */
export function PasswordField({ label, help, error, placeholder, ...props }: FieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <TextField {...props} type={shown ? 'text' : 'password'} isInvalid={props.isInvalid || !!error} className={cx(fieldWrap, props.className as string)}>
      <Label className={labelClass}>{label}</Label>
      <Group className={cx(controlBase, 'flex h-8 items-center gap-2 pr-1')}>
        <Input placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-fg-2 disabled:cursor-not-allowed" />
        <Button
          aria-label={shown ? 'Hide password' : 'Show password'}
          onPress={() => setShown((s) => !s)}
          className={cx('inline-flex size-6 items-center justify-center rounded-md text-fg-2 outline-none', fast, 'data-[hovered]:bg-inset')}
        >
          {shown ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </Button>
      </Group>
      {help && !error && <Text slot="description" className={helpClass}>{help}</Text>}
      {error && <FieldError className={errorClass}>{error}</FieldError>}
    </TextField>
  );
}

/* Input mask: behaviour only. # = digit, A = letter, * = any character. Everything else is a fixed character. */
export function applyMask(mask: string, raw: string): string {
  const chars = raw.replace(/[^0-9A-Za-z]/g, '');
  let out = '';
  let i = 0;
  for (const m of mask) {
    if (i >= chars.length) break;
    if (m === '#') { const c = chars.slice(i).match(/\d/); if (!c) break; i = chars.indexOf(c[0], i) + 1; out += c[0]; }
    else if (m === 'A') { const c = chars.slice(i).match(/[A-Za-z]/); if (!c) break; i = chars.indexOf(c[0], i) + 1; out += c[0]; }
    else if (m === '*') { out += chars[i++]; }
    else out += m;
  }
  return out;
}

export function MaskedField({ label, mask, help, error, placeholder, value, onChange, ...props }:
  FieldProps & { mask: string; value?: string; onChange?: (v: string) => void }) {
  const [inner, setInner] = useState(value ?? '');
  const v = value ?? inner;
  return (
    <TextField {...props} value={v} onChange={(x) => { const m = applyMask(mask, x); setInner(m); onChange?.(m); }}
      isInvalid={props.isInvalid || !!error} className={cx(fieldWrap, props.className as string)}>
      <Label className={labelClass}>{label}</Label>
      <Input placeholder={placeholder ?? mask.replace(/#/g, '0')} inputMode="text" className={cx(controlBase, 'h-8')} />
      {help && !error && <Text slot="description" className={helpClass}>{help}</Text>}
      {error && <FieldError className={errorClass}>{error}</FieldError>}
    </TextField>
  );
}

/* Tag: 24px, radius-sm, inset fill, label role. Optional remove button. */
export function Tags({ label, items, onRemove }: { label: string; items: { id: string; name: string }[]; onRemove?: (keys: Set<Key>) => void }) {
  return (
    <TagGroup aria-label={label} onRemove={onRemove}>
      <TagList items={items} className="flex flex-wrap gap-2">
        {(item) => (
          <RACTag id={item.id} textValue={item.name}
            className="inline-flex h-6 items-center gap-1 rounded-sm bg-inset px-2 text-label font-regular text-fg outline-none cursor-default">
            {({ allowsRemoving }) => (
              <>
                {item.name}
                {allowsRemoving && (
                  <Button slot="remove" className={cx('inline-flex size-4 items-center justify-center rounded-sm text-fg-2 outline-none', fast, 'data-[hovered]:text-fg')}>
                    <X className="size-3" aria-hidden="true" />
                  </Button>
                )}
              </>
            )}
          </RACTag>
        )}
      </TagList>
    </TagGroup>
  );
}

/* Multi-select: trigger shows the count; each selected item has a check. */
export function MultiSelect({ label, options, noun = 'selected', placeholder = 'Select', value, onChange }:
  { label: string; options: string[]; noun?: string; placeholder?: string; value?: Key[]; onChange?: (keys: Key[]) => void }) {
  const [inner, setInner] = useState<Key[]>([]);
  const v = value ?? inner;
  return (
    <Select aria-label={label} selectionMode="multiple" value={v} onChange={(k) => { const arr = Array.from(k as Iterable<Key>); setInner(arr); onChange?.(arr); }} placeholder={placeholder}>
      <Button className={cx(controlBase, 'flex h-8 w-full items-center justify-between gap-2 data-[pressed]:bg-inset')}>
        <SelectValue className="truncate">{() => (v.length === 0 ? placeholder : `${v.length} ${noun}`)}</SelectValue>
        <ChevronDown className="size-4 shrink-0 text-fg-2" aria-hidden="true" />
      </Button>
      <Popover offset={4} className="rounded-xl border border-border bg-surface p-2 shadow-md data-[entering]:opacity-0 data-[exiting]:opacity-0 transition-opacity duration-[var(--dur-normal)] ease-[var(--ease)]">
        <ListBox className="max-h-[320px] min-w-[var(--trigger-width)] overflow-auto outline-none">
          {options.map((o) => (
            <ListBoxItem key={o} id={o} textValue={o}
              className={cx('flex h-8 items-center justify-between gap-2 rounded-md px-3 text-body outline-none cursor-default', fast, 'data-[hovered]:bg-inset data-[focused]:bg-inset')}>
              {({ isSelected }) => (<><span>{o}</span>{isSelected && <Check className="size-4" aria-hidden="true" />}</>)}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

/* File upload: dashed drop area with a Choose files button. States: default, drag over, disabled. */
export function FileUpload({ hint, isDisabled, onFiles }: { hint: string; isDisabled?: boolean; onFiles?: (files: File[]) => void }) {
  return (
    <DropZone
      isDisabled={isDisabled}
      aria-label="Upload files"
      onDrop={async (e) => {
        const files = await Promise.all(e.items.filter((i) => i.kind === 'file').map((i) => (i as { getFile: () => Promise<File> }).getFile()));
        onFiles?.(files);
      }}
      className={cx(
        'flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-transparent p-4 text-center outline-none',
        fast, 'data-[drop-target]:border-accent data-[drop-target]:bg-accent-100',
        'data-[disabled]:bg-inset data-[disabled]:text-fg-3 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-[var(--focus-ring)]',
      )}
    >
      {({ isDropTarget }) => (
        <>
          <Upload className={cx('size-[20px]', isDisabled ? 'text-fg-3' : 'text-fg-2')} aria-hidden="true" />
          <Text slot="label" className={cx('text-body', isDisabled ? 'text-fg-3' : 'text-fg')}>
            {isDropTarget ? 'Drop files to upload' : 'Drag files here, or choose from your computer'}
          </Text>
          {!isDropTarget && (
            <FileTrigger allowsMultiple onSelect={(fl) => onFiles?.(fl ? Array.from(fl) : [])}>
              <DButton variant="secondary" isDisabled={isDisabled}>Choose files</DButton>
            </FileTrigger>
          )}
          <span aria-disabled={isDisabled || undefined} className={cx('text-caption', isDisabled ? 'text-fg-3' : 'text-fg-2')}>{hint}</span>
        </>
      )}
    </DropZone>
  );
}

/* Message banner: info, success, warning, error. Error is role="alert". */
const tones = {
  info: { box: 'bg-info-bg border-info-border', icon: 'text-info', Icon: Info },
  success: { box: 'bg-good-bg border-good-border', icon: 'text-good', Icon: Check },
  warning: { box: 'bg-warn-bg border-warn-border', icon: 'text-warn', Icon: TriangleAlert },
  error: { box: 'bg-crit-bg border-crit-border', icon: 'text-crit', Icon: X },
} as const;

export function MessageBanner({ tone, title, children }: { tone: keyof typeof tones; title: string; children?: ReactNode }) {
  const t = tones[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex items-start gap-3 rounded-lg border px-4 py-3', t.box)}>
      <t.Icon className={cx('mt-[2px] size-4 shrink-0', t.icon)} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-[2px]">
        <p className="text-body font-medium text-fg">{title}</p>
        {children && <p className="text-body text-fg-2">{children}</p>}
      </div>
    </div>
  );
}

/* Tooltip: toast colour, white 12px text, 8px by 4px padding. Shows on hover and keyboard focus. */
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <TooltipTrigger delay={300} closeDelay={0}>
      {children}
      <RACTooltip offset={4} className="rounded-md bg-toast px-2 py-1 text-label font-regular text-fg-inverse transition-opacity duration-[var(--dur-fast)] ease-[var(--ease)] data-[entering]:opacity-0 data-[exiting]:opacity-0">
        {text}
      </RACTooltip>
    </TooltipTrigger>
  );
}

/* Shared pieces for the Settings screens: form dialog, text field, select field, tree list. */
import React from 'react';
import {
  Button, TextField, Label, Input, TextArea, FieldError, Text, ModalOverlay, Modal, Dialog, Heading,
  Select, SelectValue, Popover, ListBox, ListBoxItem, Tree, TreeItem, TreeItemContent,
} from 'react-aria-components';
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { DButton } from './ui.jsx';

export function Clip({ w, children }) {
  return <span className="block truncate" style={{ maxWidth: w }} title={typeof children === 'string' ? children : undefined}>{children}</span>;
}

/* Dialog with a form. Pass onSubmit for a form with Cancel and a main button; leave it out for a dialog with only Close. */
export function Dlg({ title, onClose, onSubmit, submitLabel, destructive, alert, wide, closeLabel = 'Close', children }) {
  return (
    <ModalOverlay className="scrim" isOpen onOpenChange={(o) => { if (!o) onClose(); }} isDismissable>
      <Modal className="modal" style={wide ? { width: 560 } : undefined}>
        <Dialog className="modal-dialog" role={alert ? 'alertdialog' : 'dialog'}>
          {({ close }) => (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} noValidate>
              <div className="modal-head">
                <Heading slot="title" className="t-section">{title}</Heading>
                <Button className="icon-btn" aria-label="Close" onPress={close}><X className="i" aria-hidden="true" /></Button>
              </div>
              <div className="modal-body flex flex-col gap-6">{children}</div>
              <div className="modal-foot">
                {onSubmit ? (
                  <>
                    <DButton variant="secondary" onPress={close}>Cancel</DButton>
                    <DButton variant={destructive ? 'destructive' : 'primary'} type="submit">{submitLabel}</DButton>
                  </>
                ) : <DButton variant="primary" onPress={close}>{closeLabel}</DButton>}
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export function Field({ label, value, onChange, error, help, optional, multiline, ...rest }) {
  return (
    <TextField className="field" value={value} onChange={onChange} isInvalid={!!error} {...rest}>
      <Label className="field-label">{label}{optional && <span className="font-normal text-fg-2"> (optional)</span>}</Label>
      {multiline ? <TextArea className="input w-full" rows={3} style={{ height: 'auto', paddingTop: 6, paddingBottom: 6, resize: 'vertical' }} /> : <Input className="input w-full" />}
      {help && !error && <Text slot="description" className="field-help">{help}</Text>}
      <FieldError className="field-error">{error}</FieldError>
    </TextField>
  );
}

/* Select inside a form. items: [{ id, label, depth? }] */
export function SelectField({ label, items, value, onChange, placeholder = 'Select', error, help }) {
  return (
    <Select className="field" selectedKey={value} onSelectionChange={onChange} isInvalid={!!error}>
      <Label className="field-label">{label}</Label>
      <Button className="select-trigger">
        <SelectValue className="sel-value">{({ selectedText }) => selectedText || <span className="text-fg-2">{placeholder}</span>}</SelectValue>
        <ChevronDown className="i chev" aria-hidden="true" />
      </Button>
      {help && !error && <Text slot="description" className="field-help">{help}</Text>}
      {error && <Text slot="errorMessage" className="field-error">{error}</Text>}
      <Popover className="pop" offset={4}>
        <div className="pop-card" style={{ minWidth: 'var(--trigger-width)', maxHeight: 320, overflow: 'auto' }}>
          <ListBox className="menu-list" aria-label={label}>
            {items.map((o) => (
              <ListBoxItem key={o.id} id={o.id} textValue={o.label} className="menu-item">
                {({ isSelected }) => (<><span className="option-label" style={{ paddingInlineStart: (o.depth || 0) * 16 }}>{o.label}</span>{isSelected && <Check className="i" aria-hidden="true" />}</>)}
              </ListBoxItem>
            ))}
          </ListBox>
        </div>
      </Popover>
    </Select>
  );
}

/* Tree list: a hierarchy shown as rows. A row with children opens and closes when clicked. A row without children does nothing, so it has no hover fill. */
function TLNode({ n, toggle, renderMain, renderActions }) {
  const branch = !!n.children?.length;
  return (
    <TreeItem id={n.id} textValue={n.name} className="tl-item" onAction={branch ? () => toggle(n.id) : undefined}>
      <TreeItemContent>
        {({ hasChildItems, isExpanded, level }) => (
          <div className="tl-row" data-branch={hasChildItems ? '' : undefined} style={{ paddingInlineStart: 8 + (level - 1) * 24 }}>
            {hasChildItems ? (
              <Button slot="chevron" className="tl-chev">
                <ChevronRight className="i" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease)' }} aria-hidden="true" />
              </Button>
            ) : <span className="tl-chev" aria-hidden="true" />}
            {renderMain(n, level)}
            {renderActions && <span className="flex flex-none gap-1">{renderActions(n, level)}</span>}
          </div>
        )}
      </TreeItemContent>
      {n.children?.map((c) => <TLNode key={c.id} n={c} toggle={toggle} renderMain={renderMain} renderActions={renderActions} />)}
    </TreeItem>
  );
}

export function TreeList({ label, nodes, expanded, onExpandedChange, renderMain, renderActions, empty }) {
  const toggle = (id) => { const s = new Set(expanded); if (s.has(id)) s.delete(id); else s.add(id); onExpandedChange(s); };
  return (
    <Tree aria-label={label} selectionMode="none" expandedKeys={expanded} onExpandedChange={onExpandedChange} className="tl outline-none"
      renderEmptyState={() => <div className="p-6 text-fg-2">{empty}</div>}>
      {nodes.map((n) => <TLNode key={n.id} n={n} toggle={toggle} renderMain={renderMain} renderActions={renderActions} />)}
    </Tree>
  );
}

export const allIds = (nodes, out = []) => { nodes.forEach((n) => { if (n.children?.length) { out.push(n.id); allIds(n.children, out); } }); return out; };
export function filterTree(nodes, q) {
  if (!q.trim()) return nodes;
  const s = q.toLowerCase();
  return nodes.reduce((acc, n) => {
    const kids = filterTree(n.children || [], q);
    if (n.name.toLowerCase().includes(s) || kids.length) acc.push({ ...n, children: n.name.toLowerCase().includes(s) && !kids.length ? n.children : kids });
    return acc;
  }, []);
}

"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "./hooks/usePreferences";
import type { CookieSettingsDialogProps } from "./types";
import { Button, Collapsible, cn, Switch } from "./ui";

/** Renders nothing while closed; the open dialog mounts fresh each time. */
export function CookieSettingsDialog(props: Readonly<CookieSettingsDialogProps>) {
  const { settingsOpen } = usePreferences();
  return settingsOpen ? <OpenSettingsDialog {...props} /> : null;
}

function OpenSettingsDialog({
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  categoryCardClassName,
  itemClassName,
  buttonClassName,
}: Readonly<CookieSettingsDialogProps>) {
  const {
    categories,
    closeSettings,
    components,
    preferences,
    resolveLabel,
    savePreferences,
    texts,
    themeStyle,
  } = usePreferences();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Mounted only while open, so the initial value is the current decision.
  const [draft, setDraft] = useState(preferences.accepted);

  // showModal() gives us the top layer, focus trap, and Escape-to-close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const ButtonComponent = components.Button ?? Button;
  const SwitchComponent = components.Switch ?? Switch;

  const setAccepted = (ids: string[], value: boolean) =>
    setDraft((current) => {
      const next = { ...current };
      for (const id of ids) {
        next[id] = value;
      }
      return next;
    });

  const handleCancel = (event: React.SyntheticEvent) => {
    // Escape (native cancel): prevent the native close and let the parent's
    // state change unmount the dialog instead, so state stays in sync.
    event.preventDefault();
    closeSettings();
  };

  return (
    <dialog
      aria-labelledby="nsr-settings-title"
      className={cn("nsr-settings-dialog", className)}
      onCancel={handleCancel}
      ref={dialogRef}
      style={themeStyle}
    >
      {/*
        Click-to-close backdrop as a real (visually inert) button, sitting
        behind the content panel. Out of the tab order; mouse/touch only.
      */}
      <button
        aria-label={texts.dialog.close}
        className={cn("nsr-dialog__overlay", overlayClassName)}
        onClick={closeSettings}
        tabIndex={-1}
        type="button"
      />
      <div className={cn("nsr-dialog__panel", contentClassName)}>
        <div className={cn("nsr-dialog__header", headerClassName)}>
          <h2 id="nsr-settings-title" className="nsr-dialog__title">
            {texts.dialog.title}
          </h2>
          <p className="nsr-dialog__description">{texts.dialog.description}</p>
        </div>

        <div className={cn("nsr-dialog__body", bodyClassName)}>
          {categories.map((category) => {
            const { title, description } = resolveLabel(category.id, category);
            const required = Boolean(category.required);
            const items = category.items ?? [];

            return (
              <section
                className={cn(
                  "nsr-category",
                  required && "nsr-category--required",
                  categoryCardClassName,
                )}
                key={category.id}
              >
                <div className="nsr-category__header">
                  <div>
                    <h3 className="nsr-category__title">{title}</h3>
                    {description ? (
                      <p className="nsr-category__description">{description}</p>
                    ) : null}
                  </div>
                  {/* Master switch: toggles the category and all of its items. */}
                  <SwitchComponent
                    aria-label={title}
                    checked={Boolean(draft[category.id])}
                    disabled={required}
                    onCheckedChange={(value) =>
                      setAccepted([category.id, ...items.map((item) => item.id)], value)
                    }
                  />
                </div>

                {items.length > 0 ? (
                  <Collapsible
                    count={items.length}
                    label={texts.dialog.itemsLabel}
                    contentClassName="nsr-category__items"
                  >
                    {items.map((item) => {
                      const itemLabel = resolveLabel(item.id, item);

                      return (
                        <div className={cn("nsr-item", itemClassName)} key={item.id}>
                          <div>
                            <h4 className="nsr-item__title">{itemLabel.title}</h4>
                            {itemLabel.description ? (
                              <p className="nsr-item__description">
                                {itemLabel.description}
                              </p>
                            ) : null}
                          </div>
                          <SwitchComponent
                            aria-label={itemLabel.title}
                            checked={Boolean(draft[item.id])}
                            disabled={required}
                            onCheckedChange={(value) => setAccepted([item.id], value)}
                          />
                        </div>
                      );
                    })}
                  </Collapsible>
                ) : null}
              </section>
            );
          })}
        </div>

        <div className={cn("nsr-dialog__footer", footerClassName)}>
          <ButtonComponent
            className={cn("nsr-dialog__button", buttonClassName)}
            onClick={closeSettings}
            type="button"
            variant="ghost"
          >
            {texts.dialog.close}
          </ButtonComponent>
          <ButtonComponent
            className={cn("nsr-dialog__button", buttonClassName)}
            onClick={() => savePreferences({ accepted: draft })}
            type="button"
            variant="primary"
          >
            {texts.dialog.save}
          </ButtonComponent>
        </div>
      </div>
    </dialog>
  );
}

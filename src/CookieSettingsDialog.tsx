"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "./hooks/usePreferences";
import type { CookieSettingsDialogProps } from "./types";
import { Button, Collapsible, Switch, cn } from "./ui";

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
      ids.forEach((id) => {
        next[id] = value;
      });
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
      className={cn(
        "nsr-settings-dialog fixed inset-0 z-[100] m-auto flex items-center justify-center p-4",
        className,
      )}
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
        className={cn("absolute inset-0 -z-10 cursor-default", overlayClassName)}
        onClick={closeSettings}
        tabIndex={-1}
        type="button"
      />
      <div
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--nsr-border)] bg-[var(--nsr-surface)] shadow-2xl",
          contentClassName,
        )}
      >
        <div
          className={cn(
            "shrink-0 border-b border-[var(--nsr-border)] px-4 py-4 sm:px-6 sm:py-6",
            headerClassName,
          )}
        >
          <h2
            id="nsr-settings-title"
            className="text-lg font-bold text-[var(--nsr-text)] sm:text-xl"
          >
            {texts.dialog.title}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-[var(--nsr-muted)] sm:mt-2 sm:leading-6">
            {texts.dialog.description}
          </p>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6",
            bodyClassName,
          )}
        >
          {categories.map((category) => {
            const { title, description } = resolveLabel(category.id, category);
            const required = Boolean(category.required);
            const items = category.items ?? [];

            return (
              <section
                className={cn(
                  "rounded-2xl border border-[var(--nsr-border)] p-4",
                  required && "bg-zinc-50 dark:bg-zinc-900/60",
                  categoryCardClassName,
                )}
                key={category.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--nsr-text)]">
                      {title}
                    </h3>
                    {description ? (
                      <p className="mt-1 text-sm leading-6 text-[var(--nsr-muted)]">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {/* Master switch: toggles the category and all of its items. */}
                  <SwitchComponent
                    aria-label={title}
                    checked={Boolean(draft[category.id])}
                    disabled={required}
                    onCheckedChange={(value) =>
                      setAccepted(
                        [category.id, ...items.map((item) => item.id)],
                        value,
                      )
                    }
                  />
                </div>

                {items.length > 0 ? (
                  <Collapsible
                    count={items.length}
                    label={texts.dialog.itemsLabel}
                    contentClassName="mt-2 space-y-2 border-t border-[var(--nsr-border)] pt-3"
                  >
                    {items.map((item) => {
                      const itemLabel = resolveLabel(item.id, item);

                      return (
                        <div
                          className={cn(
                            "flex items-start justify-between gap-4 rounded-xl px-2 py-1.5",
                            itemClassName,
                          )}
                          key={item.id}
                        >
                          <div>
                            <h4 className="text-sm font-medium text-[var(--nsr-text)]">
                              {itemLabel.title}
                            </h4>
                            {itemLabel.description ? (
                              <p className="mt-0.5 text-xs leading-5 text-[var(--nsr-muted)]">
                                {itemLabel.description}
                              </p>
                            ) : null}
                          </div>
                          <SwitchComponent
                            aria-label={itemLabel.title}
                            checked={Boolean(draft[item.id])}
                            disabled={required}
                            onCheckedChange={(value) =>
                              setAccepted([item.id], value)
                            }
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

        <div
          className={cn(
            "flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--nsr-border)] p-4 sm:flex-row sm:justify-end sm:gap-3 sm:p-6",
            footerClassName,
          )}
        >
          <ButtonComponent
            className={cn("w-full sm:w-auto", buttonClassName)}
            onClick={closeSettings}
            type="button"
            variant="ghost"
          >
            {texts.dialog.close}
          </ButtonComponent>
          <ButtonComponent
            className={cn("w-full sm:w-auto", buttonClassName)}
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

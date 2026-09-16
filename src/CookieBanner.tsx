"use client";

import { usePreferences } from "./hooks/usePreferences";
import { CookieSettingsDialog } from "./CookieSettingsDialog";
import { Button, cn } from "./ui";
import type { CookieBannerProps } from "./types";

export function CookieBanner({
  policyUrl,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  buttonClassName,
  components,
}: Readonly<CookieBannerProps>) {
  const { acceptAll, openSettings, rejectAll, showBanner, texts, themeStyle } =
    usePreferences();

  const ButtonComponent = components?.Button ?? Button;

  return (
    <>
      {showBanner ? (
        <section
          aria-label={texts.banner.title}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--nsr-border)] bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:bg-zinc-950/95",
            className,
          )}
          style={themeStyle}
        >
          <div
            className={cn(
              "mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-[var(--nsr-border)] bg-[var(--nsr-surface)] p-5 shadow-xl lg:flex-row lg:items-center lg:justify-between",
              contentClassName,
            )}
          >
            <div className="max-w-3xl">
              <h2
                className={cn(
                  "text-base font-bold text-[var(--nsr-text)]",
                  titleClassName,
                )}
              >
                {texts.banner.title}
              </h2>
              <p
                className={cn(
                  "mt-2 text-sm leading-6 text-[var(--nsr-muted)]",
                  descriptionClassName,
                )}
              >
                {texts.banner.description}
                {policyUrl ? (
                  <>
                    {" "}
                    <a
                      className="font-semibold text-[var(--nsr-accent)] underline-offset-4 hover:underline"
                      href={policyUrl}
                    >
                      {texts.banner.policyLink}
                    </a>
                  </>
                ) : null}
              </p>
            </div>

            <div
              className={cn(
                "grid gap-2 sm:grid-cols-3 lg:min-w-[32rem]",
                actionsClassName,
              )}
            >
              <ButtonComponent
                className={buttonClassName}
                onClick={rejectAll}
                type="button"
                variant="secondary"
              >
                {texts.banner.rejectAll}
              </ButtonComponent>
              <ButtonComponent
                className={buttonClassName}
                onClick={openSettings}
                type="button"
                variant="secondary"
              >
                {texts.banner.settings}
              </ButtonComponent>
              <ButtonComponent
                className={buttonClassName}
                onClick={acceptAll}
                type="button"
                variant="primary"
              >
                {texts.banner.acceptAll}
              </ButtonComponent>
            </div>
          </div>
        </section>
      ) : null}
      <CookieSettingsDialog />
    </>
  );
}

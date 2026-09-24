"use client";

import { CookieSettingsDialog } from "./CookieSettingsDialog";
import { usePreferences } from "./hooks/usePreferences";
import type { CookieBannerProps } from "./types";
import { Button, cn } from "./ui";

export function CookieBanner({
  policyUrl,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  buttonClassName,
  components,
  dialogProps,
}: Readonly<CookieBannerProps>) {
  const {
    acceptAll,
    components: providerComponents,
    openSettings,
    rejectAll,
    showBanner,
    texts,
    themeAttributes,
  } = usePreferences();

  const ButtonComponent = components?.Button ?? providerComponents.Button ?? Button;

  return (
    <>
      {showBanner ? (
        <section
          aria-label={texts.banner.title}
          className={cn("nsr-banner", className)}
          {...themeAttributes}
        >
          <div className={cn("nsr-banner__card", contentClassName)}>
            <div className="nsr-banner__text">
              <h2 className={cn("nsr-banner__title", titleClassName)}>
                {texts.banner.title}
              </h2>
              <p className={cn("nsr-banner__description", descriptionClassName)}>
                {texts.banner.description}
                {policyUrl ? (
                  <>
                    {" "}
                    <a className="nsr-banner__link" href={policyUrl}>
                      {texts.banner.policyLink}
                    </a>
                  </>
                ) : null}
              </p>
            </div>

            <div className={cn("nsr-banner__actions", actionsClassName)}>
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
      <CookieSettingsDialog
        {...dialogProps}
        components={{ ...components, ...dialogProps?.components }}
      />
    </>
  );
}

import type { ButtonLikeProps, SwitchLikeProps } from "non-spooky-react-cookie";
import { CookieBanner, CookieBannerConfigurationProvider } from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

/** Your design system's button. Must accept `variant` plus button props. */
function PillButton({ variant = "secondary", className, ...props }: ButtonLikeProps) {
  return (
    <button
      className={[
        "pg-pill-button",
        variant === "primary" ? "pg-pill-button--primary" : "",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}

/** A switch rendered as a native checkbox. */
function CheckboxSwitch({
  checked,
  disabled,
  onCheckedChange,
  "aria-label": ariaLabel,
}: SwitchLikeProps) {
  return (
    <input
      type="checkbox"
      className="pg-checkbox-switch"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  );
}

/**
 * `components` on the provider swaps the primitives everywhere (banner and
 * dialog). Every part also takes a `className` prop; add your own classes
 * next to the built-in `nsr-*` ones.
 */
export function CustomButtonAndSwitchComponents() {
  const respectGpc = useRespectGpc();
  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-components"
      components={{ Button: PillButton, Switch: CheckboxSwitch }}
    >
      <div className="pg-card">
        <p className="pg-muted">
          Purple pill buttons and checkbox switches come from this file, not the library.
          The dashed purple border is <code>contentClassName="pg-fancy-card"</code>.
        </p>
      </div>
      <ConsentToolbar />
      {/* CookieBanner renders the settings dialog for you; style its parts
          through `dialogProps`. */}
      <CookieBanner
        contentClassName="pg-fancy-card"
        policyUrl="#/components"
        dialogProps={{
          contentClassName: "pg-fancy-card",
          buttonClassName: "pg-pill-button",
        }}
      />
    </CookieBannerConfigurationProvider>
  );
}

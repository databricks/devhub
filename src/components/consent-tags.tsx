import type { ReactNode } from "react";

import {
  GTM_CONTAINER_ID,
  ONETRUST_DOMAIN_SCRIPT_ID,
  resolveOneTrustEnv,
  resolveRudderstackKey,
} from "@/lib/onetrust";

const GTM_HEAD_SNIPPET =
  "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':" +
  "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0]," +
  "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=" +
  "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);" +
  `})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`;

// On www.databricks.com a consent change takes effect on the next page load;
// this SPA has none, so reload when consent actually changes. Rudderstack and
// Google Consent Mode react to consent on their own inside
// db-rudderstack-events.js, but GTM still drops third-party cookies that only
// unload on a real page load, so the reload stays.
//
// Deliberately does not touch OptanonWrapper. Whichever integration script is
// active owns that global — onetrust.js declares it directly, while
// db-rudderstack-events.js appends its own `function OptanonWrapper()` from a
// dynamically injected script, which would clobber anything we assigned first.
// Polling for the SDK instead makes this independent of load order and of
// which script won. The OnetrustActiveGroups snapshot is taken only once the
// SDK has published a non-empty group list (OneTrust always sets at least
// C0001 once geo and implied consent are resolved), which keeps SDK-internal
// re-fires from reloading without a real user-driven change and makes reload
// loops structurally impossible.
const CONSENT_CHANGE_SNIPPET =
  "(function(){" +
  "var attempts=0;" +
  "function ready(){" +
  "return !!window.OneTrust" +
  "&&typeof window.OneTrust.OnConsentChanged==='function'" +
  "&&typeof window.OnetrustActiveGroups==='string'" +
  "&&window.OnetrustActiveGroups.length>0;" +
  "}" +
  "function register(){" +
  "if(!ready()){if(++attempts>100)return;setTimeout(register,300);return;}" +
  "var initialGroups=window.OnetrustActiveGroups;" +
  "window.OneTrust.OnConsentChanged(function(){" +
  "if((window.OnetrustActiveGroups||'')!==initialGroups)window.location.reload();" +
  "});" +
  "}" +
  "register();" +
  "})();";

/**
 * OneTrust cookie consent + Google Tag Manager + Rudderstack, following the
 * standard Databricks install. Rendered as the first children of <body> as
 * plain blocking tags — not next/script — because the DOM order is the legal
 * contract: the OneTrust AutoBlocker must execute before the GTM snippet so
 * it can gate the cookies GTM drops, and the <noscript> iframe must sit
 * immediately after the opening <body> tag. The scripts stay in <body> in
 * source order; React hoists only the stylesheet <link> into <head>, where
 * the databricks.com install puts it too. Kept as one component so the tag
 * stack reads in the order the browser executes it. Renders nothing when no
 * consent variant applies (local dev/build); GTM never loads without OneTrust.
 *
 * Exactly one integration script renders, never both:
 *
 *   - Rudderstack on  → db-rudderstack-events.js, preceded by the write key it
 *     reads off window. It supplies its own OptanonWrapper (same opt-out cookie
 *     deletion as onetrust.js), injects the Rudderstack SDK gated on C0003, and
 *     wires OneTrust into Rudderstack and Google Consent Mode.
 *   - Rudderstack off → onetrust.js, for the cookie deletion alone.
 *
 * onetrust.js hardcodes rudderanalytics.load() with www.databricks.com's own
 * write key behind a `typeof rudderanalytics !== "undefined"` guard, so keeping
 * it alongside the SDK would send this site's traffic to the marketing source.
 * That is why this is an either/or and not an addition.
 */
export function ConsentTags(): ReactNode {
  const variant = resolveOneTrustEnv();
  if (!variant) {
    return null;
  }

  const isTest = variant === "test";
  const rudderstackKey = resolveRudderstackKey();

  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <script
        type="text/javascript"
        src={`https://www.databricks.com/sites/default/files/${isTest ? "onetrust-test" : "onetrust"}/DB_OtAutoBlock.js?v=1`}
      />
      <script
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
        data-document-language="true"
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script={
          isTest
            ? `${ONETRUST_DOMAIN_SCRIPT_ID}-test`
            : ONETRUST_DOMAIN_SCRIPT_ID
        }
      />
      {rudderstackKey ? (
        <>
          <script
            id="db-rudderstack-key"
            dangerouslySetInnerHTML={{
              __html: `window.rudderstackKey=${JSON.stringify(
                rudderstackKey,
              ).replace(/</g, "\\u003c")};`,
            }}
          />
          <script
            type="text/javascript"
            src="https://www.databricks.com/sites/default/files/rudderstack/v1/db-rudderstack-events.js"
            id="db-rudderstack-script"
          />
        </>
      ) : (
        <script
          type="text/javascript"
          src="https://www.databricks.com/wp-content/plugins/databricks/js/onetrust.js?ver=1.0.0"
          id="db-onetrust-script"
        />
      )}
      <script
        id="db-onetrust-consent-change"
        dangerouslySetInnerHTML={{ __html: CONSENT_CHANGE_SNIPPET }}
      />
      <link
        rel="stylesheet"
        id="db-onetrust-style"
        href="https://www.databricks.com/wp-content/uploads/db_onetrust.css"
        media="all"
      />
      <script
        id="db-gtm"
        dangerouslySetInnerHTML={{ __html: GTM_HEAD_SNIPPET }}
      />
    </>
  );
}

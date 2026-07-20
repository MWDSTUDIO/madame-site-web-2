/* Madame Wedding Design — site configuration (one source of truth) */
window.MWD = window.MWD || {};
window.MWD.CONFIG = {
  BASE_URL: "https://madamewedding.design",
  /* Netlify Forms — the single lane: submissions land in the Netlify
     dashboard (Forms -> enquiry, table + CSV) and email hello@ via the
     notification configured in the Netlify UI. Data stays with Netlify. */
  FORM_NAME: "enquiry",
  THANK_YOU_URL: "/inquire/thank-you/",
  CONTACT_EMAIL: "hello@madamewedding.design",
  /* Optional hosted media-kit PDF; empty string falls back to a mailto link */
  MEDIA_KIT_PDF: ""
};

/* Madame Wedding Design — site configuration (one source of truth) */
window.MWD = window.MWD || {};
window.MWD.CONFIG = {
  BASE_URL: "https://madamewedding.design",
  /* Enquiries travel two ways:
     1. FormSubmit.co (primary) — the table email straight to the inbox, like
        site 1. One-time: click the activation link FormSubmit emails on the
        first submission.
     2. Netlify Forms (parallel) — silent until form detection is enabled in
        the Netlify UI; from then on the dashboard table + CSV fills up too. */
  FORMSUBMIT_ENDPOINT: "https://formsubmit.co/ajax/hello@madamewedding.design",
  FORM_NAME: "enquiry",
  THANK_YOU_URL: "/inquire/thank-you/",
  CONTACT_EMAIL: "hello@madamewedding.design",
  /* Optional hosted media-kit PDF; empty string falls back to a mailto link */
  MEDIA_KIT_PDF: ""
};

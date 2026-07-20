/* Madame Wedding Design — site configuration (one source of truth) */
window.MWD = window.MWD || {};
window.MWD.CONFIG = {
  BASE_URL: "https://madamewedding.design",
  /* Netlify Forms: submissions land in the Netlify dashboard (Forms -> enquiry,
     table view + CSV export) and can notify hello@madamewedding.design.
     Enable form detection once: Netlify -> Project configuration -> Forms. */
  FORM_NAME: "enquiry",
  THANK_YOU_URL: "/inquire/thank-you/",
  CONTACT_EMAIL: "hello@madamewedding.design",
  /* Optional hosted media-kit PDF; empty string falls back to a mailto link */
  MEDIA_KIT_PDF: ""
};

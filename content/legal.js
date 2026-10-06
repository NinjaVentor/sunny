// Legal + utility page content (About, Contact, Privacy, Terms, DMCA).
// Each page: { slug, title, description, sections: [{h, html}] } — html is trusted markup.
module.exports = [
  {
    slug: "about",
    title: "About Us",
    description:
      "Learn what SunnyToolsPro does, our mission to keep everyday digital tools free, and why users across the UAE and beyond trust our platform.",
    intro:
      "SunnyToolsPro is a free online toolkit that brings everyday digital utilities — PDF tools, image tools, converters and calculators — together with live UAE information such as prayer times, currency rates, weather and gold prices.",
    sections: [
      {
        h: "What SunnyToolsPro does",
        html: "<p>SunnyToolsPro started with a simple observation: most people need the same small digital tasks done every week — converting a photo to a PDF for a job application, compressing an image before uploading it, checking the live currency rate before sending money home, or confirming today's prayer times. Each of these tasks usually means a different website, a new account, or a paid app.</p><p>We built one calm, fast place for all of them. Our PDF tools handle everyday conversions and merges. Our image tools shrink, resize and crop photos right in your browser. Our calculators cover UAE VAT, currency conversion at live rates, age calculation and unit conversion. And our UAE dashboard keeps prayer times, weather, gold prices, fuel context and the Hijri date one glance away.</p>",
      },
      {
        h: "Our mission",
        html: "<p>Our mission is to keep useful digital tools free, private and accessible to everyone — on any device, without accounts, without subscriptions, and without uploading personal files to unknown servers. We believe a tool you use for two minutes should not cost you your email address or your privacy.</p><p>That is why the majority of our tools process files locally in your browser. Your photos and documents never leave your device for most conversions and edits, which is both faster and fundamentally more private than server-side processing.</p>",
      },
      {
        h: "Why users trust our web tools",
        html: "<ul><li><strong>No sign-ups, no paywalls.</strong> Every tool on this site is free to use with no account required and no hidden charges.</li><li><strong>Privacy by design.</strong> Client-side processing means your files stay on your device. Our <a href='/privacy-policy'>Privacy Policy</a> explains exactly what is (and is not) collected.</li><li><strong>Mobile-first.</strong> Every tool and every content page is designed to work on a phone first, because most of our users visit from mobile.</li><li><strong>Live, sourced data.</strong> Currency rates, weather, gold prices and prayer times come from established data providers and refresh automatically.</li><li><strong>Clear limits.</strong> Where a tool has limits (for example file-size caps), we state them up front instead of failing silently.</li></ul>",
      },
      {
        h: "Who builds SunnyToolsPro",
        html: "<p>SunnyToolsPro is designed and built by Sunny Janjowa, with contributions from Sabir Ali. We maintain the site, write the guides in our <a href='/blog'>blog</a>, and answer support messages ourselves. If something is broken or confusing, <a href='/contact'>contact us</a> — real humans read every message.</p>",
      },
      {
        h: "What is next",
        html: "<p>We keep adding tools based on what users actually ask for. Planned additions include more document converters, additional calculators for Gulf-region needs, and expanded UAE information. Bookmark the site and check the <a href='/blog'>blog</a> for new guides as tools launch.</p>",
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact Us",
    description:
      "Contact the SunnyToolsPro team for support, feedback, tool requests or business enquiries. We reply to every genuine message.",
    intro:
      "Questions, broken tools, feature requests or business enquiries — send us a message using the form below or email us directly.",
    sections: [
      {
        h: "Send us a message",
        html: "<p>Fill in the form and your email app will open with your message pre-addressed to our support inbox. We read every message and aim to reply within 2–3 working days.</p>{{CONTACT_FORM}}<p class='muted'>Prefer email? Write to us directly at <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a>. Please include the tool name, your device and browser, and (for file issues) the file type and size — it helps us reproduce the problem faster.</p>",
      },
      {
        h: "Before you write",
        html: "<ul><li><strong>Tool not working?</strong> Tell us which tool page you were on, what file you used, and what error you saw.</li><li><strong>Wrong rate or time?</strong> Currency, weather and gold data refresh automatically; tell us the value you saw and the time so we can check the provider.</li><li><strong>Removal requests?</strong> For copyright issues use our <a href='/dmca'>DMCA process</a> instead — it is faster because it asks for exactly what we need.</li></ul>",
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How SunnyToolsPro handles your data: cookieless client-side file processing, local browser storage, and Google AdSense third-party cookie disclosures.",
    intro: "Last updated: 6 October 2026. This policy explains what SunnyToolsPro collects, what it never collects, and how advertising cookies work on this site.",
    sections: [
      {
        h: "The short version",
        html: "<p>Most tools on this site process your files <strong>locally in your browser</strong> — your documents and photos are never uploaded to our servers. We do not require accounts, so we do not hold names, passwords or profiles. Like almost every free website, we use standard analytics and Google AdSense advertising, which use cookies as described below.</p>",
      },
      {
        h: "1. File processing and uploads",
        html: "<p>Our PDF, image, text and calculator tools run <strong>client-side</strong>: the conversion or calculation happens on your own device using JavaScript. For these tools, your files are not transmitted to, stored on, or viewable by us.</p><p>A small number of features fetch public reference data (currency rates, weather, gold prices, geocoding suggestions) from third-party data providers. These requests contain no personal information — only the query itself, such as a city name or currency code. Live prayer times are fetched directly from the Aladhan API by your browser.</p>",
      },
      {
        h: "2. Local browser storage",
        html: "<p>We store a minimal site preference — your light/dark theme choice — in your browser's <code>localStorage</code>. This data never leaves your device, is never sent to our servers, and can be cleared at any time from your browser settings. We do not use local storage to track you across sites.</p>",
      },
      {
        h: "3. Information you give us",
        html: "<p>If you contact us at <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a>, we receive your email address and message content. We use it only to respond, and we do not sell, rent or share it with marketers. Contact messages are retained only as long as needed to resolve your enquiry.</p>",
      },
      {
        h: "4. Google AdSense and third-party cookies",
        html: "<p>We use <strong>Google AdSense</strong> to serve advertisements. Google and its partners use cookies to serve ads based on your prior visits to this and other websites.</p><ul><li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and other sites on the Internet.</li><li>You may opt out of personalized advertising by visiting <a href='https://www.google.com/settings/ads' rel='nofollow noopener'>Google Ads Settings</a>.</li><li>Alternatively, you can opt out of third-party vendor cookies for personalized advertising at <a href='https://www.aboutads.info/choices/' rel='nofollow noopener'>aboutads.info/choices</a>.</li></ul><p>These third-party cookies are set and controlled by Google and its ad partners under their own policies, including Google's <a href='https://policies.google.com/privacy' rel='nofollow noopener'>Privacy Policy</a> and <a href='https://policies.google.com/technologies/ads' rel='nofollow noopener'>advertising technologies policy</a>.</p>",
      },
      {
        h: "5. Log data and security",
        html: "<p>Our hosting provider (Cloudflare) automatically processes standard technical log data — such as IP addresses, browser type and requested pages — to deliver the site securely and prevent abuse. We do not combine log data with any personal profile, because no profiles exist.</p>",
      },
      {
        h: "6. Children's privacy",
        html: "<p>SunnyToolsPro is a general-audience utilities site and is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has contacted us with personal data, email us and we will delete it promptly.</p>",
      },
      {
        h: "7. Your rights and choices",
        html: "<ul><li>Block or delete cookies in your browser settings at any time; the site's tools continue to work.</li><li>Clear site data (including the theme preference) from your browser settings.</li><li>Request a copy or deletion of any contact correspondence by emailing <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a>.</li></ul>",
      },
      {
        h: "8. Changes to this policy",
        html: "<p>We will update the date above whenever this policy changes materially. Continued use of the site after changes means you accept the updated policy. For questions about privacy, contact <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a>.</p>",
      },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description:
      "Terms and conditions for using SunnyToolsPro: fair usage, user conduct, intellectual property, and warranty disclaimers.",
    intro: "Last updated: 6 October 2026. By accessing SunnyToolsPro you agree to these terms. If you do not agree, please do not use the site.",
    sections: [
      {
        h: "1. The service",
        html: "<p>SunnyToolsPro provides free online tools (converters, calculators, editors), informational widgets (prayer times, currency, weather, gold), guides and listings. Tools are provided for lawful personal and business use. We may modify, limit or discontinue any tool at any time without notice.</p>",
      },
      {
        h: "2. User conduct",
        html: "<p>You agree not to:</p><ul><li>Use the tools for any unlawful purpose, including processing material you have no right to use.</li><li>Attempt to disrupt the site — no automated scraping at abusive rates, no vulnerability probing, no bypassing stated file-size or rate limits.</li><li>Upload or process malware, or use outputs of our tools to mislead others (forged documents, manipulated images presented as genuine).</li><li>Misrepresent the site's data (rates, prayer times, prices) as professional financial, religious or legal advice.</li></ul>",
      },
      {
        h: "3. Fair usage policy",
        html: "<p>The service is free and shared. To keep it fast for everyone we apply reasonable technical limits: maximum file sizes per tool, request throttling on live-data endpoints, and automatic retries instead of manual hammering. Circumventing these limits (for example with botnets or parallel abuse) may result in your IP being temporarily blocked by our hosting provider.</p>",
      },
      {
        h: "4. Your content and files",
        html: "<p>You retain all rights to files you process with our tools. Because most processing happens locally in your browser, we never receive your files at all. For any content you send us (support messages, feedback), you grant us permission to use it to operate and improve the service, and you confirm you have the right to share it.</p>",
      },
      {
        h: "5. Intellectual property",
        html: "<p>The site's design, text guides, logos and tool interfaces are owned by SunnyToolsPro and protected by applicable intellectual-property laws. You may link to our pages and share our guides with attribution. You may not copy substantial portions of the site, rebrand our tools as your own, or frame our pages in a way that confuses users about the source. Third-party trademarks mentioned on the site belong to their owners. Copyright complaints follow our <a href='/dmca'>DMCA process</a>.</p>",
      },
      {
        h: "6. Third-party data and links",
        html: "<p>Currency rates are reference rates (exchange-house rates differ), weather and gold data come from third-party providers, and prayer-time calculations depend on the selected city and method. Always verify critical figures with an authoritative source. External links are provided for convenience; we are not responsible for third-party sites.</p>",
      },
      {
        h: "7. Disclaimer of warranty",
        html: "<p>THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. We do not warrant that tools will always be available, error-free, or suitable for your specific task — always keep backups of important files and check important outputs.</p>",
      },
      {
        h: "8. Limitation of liability",
        html: "<p>To the maximum extent permitted by law, SunnyToolsPro and its maintainers are not liable for any indirect, incidental or consequential loss arising from use of the site — including data loss, missed deadlines, or financial decisions based on reference rates. Your sole remedy for dissatisfaction is to stop using the site.</p>",
      },
      {
        h: "9. Changes and contact",
        html: "<p>We may update these terms; continued use after changes constitutes acceptance. Questions: <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a> or our <a href='/contact'>contact page</a>.</p>",
      },
    ],
  },
  {
    slug: "dmca",
    title: "DMCA & Copyright Policy",
    description:
      "How to report copyright or trademark infringement on SunnyToolsPro: notice requirements, counter-notices, and our takedown process.",
    intro:
      "SunnyToolsPro respects intellectual-property rights. If you believe content on this site infringes your copyright or trademark, follow the process below for the fastest resolution.",
    sections: [
      {
        h: "Filing a takedown notice (step by step)",
        html: "<p><strong>Step 1 — Identify the work.</strong> Tell us exactly what copyrighted work you own (title, and a link or registration if available).</p><p><strong>Step 2 — Identify the infringing material.</strong> Send the exact URL(s) on this site and describe what on the page infringes.</p><p><strong>Step 3 — Add your contact details.</strong> Full name, email address and (for companies) your role and company name.</p><p><strong>Step 4 — Include two statements.</strong> (a) “I have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.” (b) “The information in this notice is accurate, and under penalty of perjury I am authorized to act on behalf of the owner.”</p><p><strong>Step 5 — Sign and send.</strong> Physical or electronic signature, then email everything to <a href='mailto:support@yourdomain.com'>support@yourdomain.com</a> with the subject line “DMCA Takedown Notice”.</p>",
      },
      {
        h: "What happens next",
        html: "<ul><li>We acknowledge valid notices within 2–3 working days.</li><li>Clearly infringing material is removed or disabled promptly; borderline cases are reviewed individually.</li><li>We may notify the affected user or content source where appropriate.</li><li>Repeat infringers lose access to interactive features of the site.</li></ul>",
      },
      {
        h: "Counter-notices",
        html: "<p>If your content was removed and you believe the removal was a mistake (for example fair use, or you hold a licence), reply to our removal email with: the removed URL, an explanation of why it is lawful, your contact details, consent to the jurisdiction of your local courts, and your signature. We review counter-notices within 5 working days and may restore material where the original complaint does not hold up — unless the complainant files court action.</p>",
      },
      {
        h: "Trademark reports",
        html: "<p>For trademarks, use the same process but identify the registered mark, registration number and country, and explain how the site's use causes confusion. Nominative fair use (for example truthfully naming a file format) is not infringement.</p>",
      },
      {
        h: "Abuse of this process",
        html: "<p>Knowingly false notices can carry legal liability. Do not use DMCA notices for defamation, to suppress criticism, or for disputes better handled as <a href='/contact'>general contact</a> messages.</p>",
      },
    ],
  },
];

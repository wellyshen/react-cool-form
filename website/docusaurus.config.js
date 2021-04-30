const github = "https://github.com/wellyshen/react-cool-form";

module.exports = {
  title: "React Cool Form",
  url: "https://react-cool-form.netlify.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  customFields: {
    description:
      "React hooks for forms state and validation, less code more performant.",
    keywords: [
      "React",
      "Hooks",
      "React-hooks",
      "Forms",
      "Form",
      "Form-builder",
      "Form-validation",
      "Form-state",
      "Validation",
      "State",
      "State-management",
      "DX",
      "UX",
      "Performance",
      "Controlled",
      "Uncontrolled",
      "Asynchronous",
      "Typescript",
    ],
  },
  organizationName: "wellyshen",
  projectName: "react-cool-form",
  themeConfig: {
    image: "img/react-cool-form.png",
    colorMode: { defaultMode: "dark" },
    announcementBar: {
      id: "start_us",
      content: `Hi! friends, if this library has helped you out, please support us with a ⭐️ on <a href=${github} target="_blank" rel="noopener noreferrer">GitHub</a>`,
      textColor: "#fff",
      backgroundColor: "#1c7ef7",
    },
    algolia: {
      apiKey: "0afb2d2ec7187233d3642b33908d1bf1",
      indexName: "react-cool-form",
      contextualSearch: true,
    },
    googleAnalytics: {
      trackingID: "UA-186962415-1",
      anonymizeIP: true,
    },
    navbar: {
      title: "React Cool Form",
      logo: {
        alt: "React Cool Form",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "/docs",
          label: "Docs",
          position: "right",
        },
        {
          to: "/docs/examples/basic",
          label: "Examples",
          position: "right",
        },
        {
          to: "/docs/api-reference/use-form",
          label: "API",
          position: "right",
        },
        {
          href: github,
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs",
            },
            {
              label: "Examples",
              to: "/docs/examples/basic",
            },
            {
              label: "API Reference",
              to: "/docs/api-reference/use-form",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href:
                "https://stackoverflow.com/questions/tagged/react-cool-form",
            },
            {
              label: "Contributor Covenant",
              href:
                "https://www.contributor-covenant.org/version/2/0/code_of_conduct",
            },
          ],
        },
        {
          title: "More",
          items: [
            { label: "GitHub", href: github },
            {
              html: `
                <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" />
                </a>
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Welly Shen.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "../docs",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: `${github}/edit/master/website`,
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
      },
    ],
  ],
  plugins: ["docusaurus-plugin-sass"],
};

const github = "https://github.com/wellyshen/react-cool-form";

module.exports = {
  title: "React Cool Form",
  url: "https://react-cool-form.netlify.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "wellyshen",
  projectName: "react-cool-form",
  themeConfig: {
    colorMode: { defaultMode: "dark" },
    announcementBar: {
      id: "start_us",
      content: `⭐ If you like React Cool Form, give it a star on <a href=${github} target="_blank" rel="noopener noreferrer">GitHub</a>!`,
      backgroundColor: "#fbb243",
    },
    navbar: {
      title: "React Cool Form",
      /* logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      }, */
      items: [
        {
          to: "/docs",
          label: "Docs",
          position: "right",
        },
        {
          to: "/docs/basic",
          label: "Examples",
          position: "right",
        },
        {
          to: "/docs/use-form",
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
              to: "/docs/basic",
            },
            {
              label: "API Reference",
              to: "/docs/use-form",
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
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
      },
    ],
  ],
  plugins: ["docusaurus-plugin-sass"],
};

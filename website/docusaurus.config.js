module.exports = {
  title: "React Cool Form",
  tagline:
    "React hooks for forms state and validation, less code more performant",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "wellyshen", // Usually your GitHub org/user name.
  projectName: "react-cool-form", // Usually your repo name.
  themeConfig: {
    colorMode: { defaultMode: "dark" },
    announcementBar: {
      id: "start_us",
      content:
        '🤩 If you like React Cool Form, give it a star on <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>!',
    },
    navbar: {
      title: "React Cool Form",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          href: "https://github.com/wellyshen/react-cool-form",
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
              to: "docs/",
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
          title: "Social",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/wellyshen/react-cool-form",
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
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/wellyshen/react-cool-form/edit/master/docs",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};

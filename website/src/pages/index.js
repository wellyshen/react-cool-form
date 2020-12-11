import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";

import styles from "./styles.module.scss";

const features = [
  {
    title: "Easy to Use",
    imageUrl: "img/plug.svg",
    description: (
      <>
        React Cool Form is a React{" "}
        <Link to="https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook">
          hook
        </Link>
        , it's designed to be a <b>plug-and-play</b>. You can easily plug it
        into any forms you that want.
      </>
    ),
  },
  {
    title: "Manage Complex Data",
    imageUrl: "img/layout.svg",
    description: (
      <>
        Struggling with form structures? With React Cool Form{" "}
        <Link to="#">nested fields</Link> API, you can create complex form
        structures without hassle.
      </>
    ),
  },
  {
    title: "Validate by Your Way",
    imageUrl: "img/checklist.svg",
    description: (
      <>
        Supports <Link to="#">built-in</Link>, <Link to="#">field-level</Link>,
        any <Link to="#">form-level</Link> validations, which can cover all the
        cases that you need.
      </>
    ),
  },
  {
    title: "Highly Performant",
    imageUrl: "img/superhero.svg",
    description: (
      <>
        <Link to="#">Minimizes the number of re-renders</Link> for you. Building
        forms with great user experience can be a natural thing.
      </>
    ),
  },
  {
    title: "Developer Experience",
    imageUrl: "img/coding.svg",
    description: (
      <>
        Intuitive and flexible <Link to="/docs/use-form">API</Link> design, also
        provides a seamless way to integration with{" "}
        <Link to="#">custom components</Link> or{" "}
        <Link to="#">UI libraries</Link>.
      </>
    ),
  },
  {
    title: "Super Lightweight",
    imageUrl: "img/loading.svg",
    description: (
      <>
        The lower size the faster speed. React Cool Form is a tiny (
        <Link to="https://bundlephobia.com/result?p=react-cool-form">
          ~ 4.8KB gzipped
        </Link>
        ) but powerful library.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout description="React hooks for forms state and validation, less code more performant.">
      <header className={clsx("hero", styles.heroBanner)}>
        <div className="container">
          <h1 className={clsx("hero__title", styles.heroTitle)}>
            React hooks for forms <b>state</b> and <b>validation</b>, less code
            more <b>performant</b>
          </h1>
          <div className={styles.buttons}>
            <Link
              className={clsx("button button--lg", styles.getStarted)}
              to={useBaseUrl("docs/")}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className={styles.showbox}>
          <h2>Performance Matters</h2>
          <p>
            Building forms in React can be simple and performant. React Cool
            Form eliminates unnecessary re-renders throughout the development
            process. Now dive into the following example to learn more.
          </p>
          <iframe
            className={styles.iframe}
            src="https://codesandbox.io/embed/rcf-showbox-8b0qn?fontsize=14&hidenavigation=1&theme=dark"
            title="RCF - Showbox"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          ></iframe>
        </section>
      </main>
    </Layout>
  );
}

export default Home;

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
        React Cool Form is{" "}
        <Link to="/docs/api-reference/use-form">a set of React hooks</Link> that
        helps you conquer all kinds of forms. See how easy to{" "}
        <Link to="/docs/getting-started/integration-an-existing-form">
          integrate it with your form
        </Link>
        .
      </>
    ),
  },
  {
    title: "Manage Complex Data",
    imageUrl: "img/layout.svg",
    description: (
      <>
        Struggling with form structures? With React Cool Form{" "}
        <Link to="/docs/getting-started/complex-structures">nested fields</Link>{" "}
        API, you can create complex form structures without hassle.
      </>
    ),
  },
  {
    title: "Validate by Your Favor",
    imageUrl: "img/checklist.svg",
    description: (
      <>
        Supports{" "}
        <Link to="/docs/getting-started/validation-guide#built-in-validation">
          built-in
        </Link>
        ,{" "}
        <Link to="/docs/getting-started/validation-guide#form-level-validation">
          form-level
        </Link>
        , and{" "}
        <Link to="/docs/getting-started/validation-guide#field-level-validation">
          field-level
        </Link>{" "}
        validation, which can cover all the cases that you need.
      </>
    ),
  },
  {
    title: "Highly Performant",
    imageUrl: "img/superhero.svg",
    description: (
      <>
        <Link to="#performance-matters">
          Minimizes the number of re-renders
        </Link>{" "}
        for you. Building forms with great user experience can be a natural
        thing.
      </>
    ),
  },
  {
    title: "Developer Experience",
    imageUrl: "img/coding.svg",
    description: (
      <>
        Intuitive and flexible{" "}
        <Link to="/docs/api-reference/use-form">APIs</Link> design, provides a
        seamless way to integration with existing HTML form inputs or{" "}
        <Link to="/docs/getting-started/3rd-party-ui-libraries">
          3rd-party UI libraries
        </Link>
        .
      </>
    ),
  },
  {
    title: "Super Lightweight",
    imageUrl: "img/loading.svg",
    description: (
      <>
        The lower size the faster speed. React Cool Form is a{" "}
        <Link to="/docs/getting-started/bundle-size-overview">tiny size</Link>{" "}
        library but powerful.
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
  const { description, keywords } = context.siteConfig.customFields;
  return (
    <Layout description={description} keywords={keywords}>
      <header className={clsx("hero", styles.heroBanner)}>
        <div className="container">
          <img src="/img/logo.svg" alt="React Cool Form" />
          <div>
            <h1 className={clsx("hero__title", styles.heroTitle)}>
              React hooks for forms <b>state</b> and <b>validation</b>, less
              code more <b>performant</b>
            </h1>
            <div className={styles.buttons}>
              <Link
                className={clsx("button button--lg", styles.getStarted)}
                to={useBaseUrl("docs/")}
              >
                Get Started
              </Link>
              <span className={styles.gitHubBtnWrapper}>
                <iframe
                  className={styles.gitHubBtn}
                  src="https://ghbtns.com/github-btn.html?user=wellyshen&repo=react-cool-form&type=star&count=true&size=large"
                  width={160}
                  height={30}
                  title="GitHub Stars"
                />
              </span>
            </div>
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
          <h2 id="performance-matters">Performance Matters</h2>
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
          />
        </section>
      </main>
    </Layout>
  );
}

export default Home;

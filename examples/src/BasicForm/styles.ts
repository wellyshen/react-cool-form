import { css } from "@emotion/core";

export const container = css`
  display: flex;
  justify-content: center;
  margin: 5rem 0;
`;

export const form = css`
  display: flex;
  flex-direction: column;
  width: 500px;
  input,
  select,
  textarea,
  button {
    margin-bottom: 1rem;
  }
`;

export const label = css`
  margin-right: 0.5rem;
`;

export const wrapper = css`
  label:not(:first-of-type) {
    margin-left: 1rem;
  }
`;

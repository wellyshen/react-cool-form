import { render, fireEvent, waitFor, screen } from "@testing-library/react";

import { Config } from "./types";
import useForm from "./useForm";

interface Props extends Config<any> {
  children: JSX.Element;
  onSubmit: (values: any) => void;
}

const Form = ({ children, onSubmit, ...config }: Props) => {
  const { form } = useForm({
    ...config,
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form data-testid="form" ref={form}>
      {children}
    </form>
  );
};

describe("useForm", () => {
  describe("form values", () => {
    it("should set default values correctly", async () => {
      const defaultValues = { foo: "🍎" };
      const onSubmit = jest.fn();
      render(
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          <input name="foo" />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });
  });
});

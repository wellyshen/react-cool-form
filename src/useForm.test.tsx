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
    const onSubmit = jest.fn();
    
    it("should set defaultValues option correctly", async () => {
      const defaultValues = { foo: "🍎" };
      render(
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          <input name="foo" />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set defaultValue attribute correctly", async () => {
      const defaultValue = "🍎";
      render(
        <Form onSubmit={onSubmit}>
          <input name="foo" defaultValue={defaultValue} />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: defaultValue })
      );
    });

    it("should handle text change correctly", async () => {
      render(
        <Form onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" />
        </Form>
      );

      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: "" }));

      const value = "🍎";
      fireEvent.change(screen.getByTestId("foo"), { target: { value } });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });
  });
});

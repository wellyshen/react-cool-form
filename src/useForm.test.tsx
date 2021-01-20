import { render, fireEvent, waitFor, screen } from "@testing-library/react";

import { Config } from "./types";
import useForm from "./useForm";

interface Props extends Config<any> {
  children: JSX.Element | JSX.Element[];
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
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  describe("default values", () => {
    const defaultValues = {
      text: "🍎",
      number: 1,
      range: 1,
      checkbox: true,
      checkboxes: ["🍎"],
      radio: "🍎",
      select: "🍎",
      selects: ["🍎", "🍋"],
      textarea: "🍎",
    };

    it("should set values correctly via defaultValues option", async () => {
      render(
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          <input data-testid="text" name="text" />
          <input name="number" type="number" />
          <input name="range" type="range" />
          <input name="checkbox" type="checkbox" />
          <input name="checkboxes" type="checkbox" value="🍎" />
          <input name="checkboxes" type="checkbox" value="🍋" />
          <input name="radio" type="radio" value="🍎" />
          <input name="radio" type="radio" value="🍋" />
          <select name="select">
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
          <select name="selects" multiple>
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
          <textarea name="textarea" />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set values correctly via defaultValue attributes", async () => {
      render(
        <Form onSubmit={onSubmit}>
          <input name="text" defaultValue={defaultValues.text} />
          <input
            name="number"
            type="number"
            defaultValue={defaultValues.number}
          />
          <input name="range" type="range" defaultValue={defaultValues.range} />
          <input name="checkbox" type="checkbox" defaultChecked />
          <input name="checkboxes" type="checkbox" value="🍎" defaultChecked />
          <input name="checkboxes" type="checkbox" value="🍋" />
          <input name="radio" type="radio" value="🍎" defaultChecked />
          <input name="radio" type="radio" value="🍋" />
          <select name="select" defaultValue={defaultValues.select}>
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
          <select name="selects" multiple defaultValue={defaultValues.selects}>
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
          <textarea name="textarea" defaultValue={defaultValues.textarea} />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });
  });

  describe("handle change", () => {
    it("should handle text change correctly", async () => {
      render(
        <Form defaultValues={{ foo: "🍋" }} onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" />
        </Form>
      );
      const value = "🍎";
      fireEvent.input(screen.getByTestId("foo"), { target: { value } });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });
  });
});

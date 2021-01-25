import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Config } from "./types";
import useForm, { missingNameMsg } from "./useForm";

interface Props extends Config<any> {
  children: JSX.Element | JSX.Element[];
  onSubmit?: (values: any) => void;
  onError?: (errors: any) => void;
}

const Form = ({
  children,
  onSubmit = () => null,
  onError = () => null,
  ...config
}: Props) => {
  const { form } = useForm({
    ...config,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
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

  describe("warning", () => {
    it("should warn for a missing name field", () => {
      console.warn = jest.fn();
      render(
        <Form>
          <input data-testid="foo" />
        </Form>
      );
      fireEvent.input(screen.getByTestId("foo"));
      expect(console.warn).toHaveBeenNthCalledWith(2, missingNameMsg);
    });

    it("should not warn for a missing name field when it's excluded", () => {
      console.warn = jest.fn();
      render(
        <Form>
          <input data-rcf-exclude />
        </Form>
      );
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not warn for a missing name field in production", () => {
      // @ts-expect-error
      global.__DEV__ = false;
      console.warn = jest.fn();
      render(
        <Form>
          <input />
        </Form>
      );
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe("default values", () => {
    const getByTestId = screen.getByTestId as any;
    const defaultValues = {
      text: "🍎",
      number: 1,
      range: 10,
      checkbox: true,
      checkboxes: ["🍎"],
      radio: "🍎",
      textarea: "🍎",
      select: "🍎",
      selects: ["🍎", "🍋"],
    };
    const defaultNestedValue = { text: { a: [{ b: "🍎" }] } };

    it("should set values correctly via defaultValues option", async () => {
      render(
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          <input data-testid="text" name="text" />
          <input data-testid="number" name="number" type="number" />
          <input data-testid="range" name="range" type="range" />
          <input data-testid="checkbox" name="checkbox" type="checkbox" />
          <input
            data-testid="checkboxes-0"
            name="checkboxes"
            type="checkbox"
            value="🍎"
          />
          <input
            data-testid="checkboxes-1"
            name="checkboxes"
            type="checkbox"
            value="🍋"
          />
          <input data-testid="radio-0" name="radio" type="radio" value="🍎" />
          <input data-testid="radio-1" name="radio" type="radio" value="🍋" />
          <textarea data-testid="textarea" name="textarea" />
          <select name="select">
            <option data-testid="select-0" value="🍎">
              🍎
            </option>
            <option data-testid="select-1" value="🍋">
              🍋
            </option>
          </select>
          <select name="selects" multiple>
            <option data-testid="selects-0" value="🍎">
              🍎
            </option>
            <option data-testid="selects-1" value="🍋">
              🍋
            </option>
          </select>
        </Form>
      );
      const {
        text,
        number,
        range,
        checkbox,
        checkboxes,
        radio,
        textarea,
        select,
        selects,
      } = defaultValues;

      expect(getByTestId("text").value).toBe(text);
      expect(getByTestId("number").value).toBe(number.toString());
      expect(getByTestId("range").value).toBe(range.toString());
      expect(getByTestId("checkbox").checked).toBe(checkbox);
      const checkboxes0 = getByTestId("checkboxes-0");
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = getByTestId("checkboxes-1");
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      const radio0 = getByTestId("radio-0");
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = getByTestId("radio-0");
      expect(radio1.checked).toBe(radio1.value === radio);
      expect(getByTestId("textarea").value).toBe(textarea);
      const select0 = getByTestId("select-0");
      expect(select0.selected).toBe(select0.value === select);
      const select1 = getByTestId("select-1");
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = getByTestId("selects-0");
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = getByTestId("selects-1");
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set values correctly via defaultValue attribute", async () => {
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
          <textarea name="textarea" defaultValue={defaultValues.textarea} />
          <select name="select" defaultValue={defaultValues.select}>
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
          <select name="selects" multiple defaultValue={defaultValues.selects}>
            <option value="🍎">🍎</option>
            <option value="🍋">🍋</option>
          </select>
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should set values correctly via value attribute", async () => {
      render(
        <Form onSubmit={onSubmit}>
          <input data-testid="text" name="text" />
          <input data-testid="number" name="number" type="number" />
          <input data-testid="range" name="range" type="range" />
          <input data-testid="checkbox" name="checkbox" type="checkbox" />
          <input
            data-testid="checkboxes-0"
            name="checkboxes"
            type="checkbox"
            value="🍎"
          />
          <input
            data-testid="checkboxes-1"
            name="checkboxes"
            type="checkbox"
            value="🍋"
          />
          <input data-testid="radio-0" name="radio" type="radio" value="🍎" />
          <input data-testid="radio-1" name="radio" type="radio" value="🍋" />
          <textarea data-testid="textarea" name="textarea" />
          <select name="select">
            <option data-testid="select-0" value="🍎">
              🍎
            </option>
            <option data-testid="select-1" value="🍋">
              🍋
            </option>
          </select>
          <select name="selects" multiple>
            <option data-testid="selects-0" value="🍎">
              🍎
            </option>
            <option data-testid="selects-1" value="🍋">
              🍋
            </option>
          </select>
        </Form>
      );
      const values: any = {
        text: "",
        number: "",
        range: 50,
        checkbox: false,
        checkboxes: [],
        radio: "",
        textarea: "",
        select: "🍎",
        selects: [],
      };
      const {
        text,
        number,
        range,
        checkbox,
        checkboxes,
        radio,
        textarea,
        select,
        selects,
      } = values;

      expect(getByTestId("text").value).toBe(text);
      expect(getByTestId("number").value).toBe(number.toString());
      expect(getByTestId("range").value).toBe(range.toString());
      expect(getByTestId("checkbox").checked).toBe(checkbox);
      const checkboxes0 = getByTestId("checkboxes-0");
      expect(checkboxes0.checked).toBe(checkboxes.includes(checkboxes0.value));
      const checkboxes1 = getByTestId("checkboxes-1");
      expect(checkboxes1.checked).toBe(checkboxes.includes(checkboxes1.value));
      expect(getByTestId("textarea").value).toBe(textarea);
      const radio0 = getByTestId("radio-0");
      expect(radio0.checked).toBe(radio0.value === radio);
      const radio1 = getByTestId("radio-0");
      expect(radio1.checked).toBe(radio1.value === radio);
      const select0 = getByTestId("select-0");
      expect(select0.selected).toBe(select0.value === select);
      const select1 = getByTestId("select-1");
      expect(select1.selected).toBe(select1.value === select);
      const selects0 = getByTestId("selects-0");
      expect(selects0.selected).toBe(selects.includes(selects0.value));
      const selects1 = getByTestId("selects-1");
      expect(selects1.selected).toBe(selects.includes(selects1.value));

      fireEvent.submit(getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(values));
    });

    it("should set nested values correctly via defaultValues option", async () => {
      render(
        <Form defaultValues={defaultNestedValue} onSubmit={onSubmit}>
          <input data-testid="text" name="text.a[0].b" />
        </Form>
      );

      expect(getByTestId("text").value).toBe(defaultNestedValue.text.a[0].b);

      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(defaultNestedValue)
      );
    });

    it("should set nested values correctly via defaultValue attribute", async () => {
      render(
        <Form onSubmit={onSubmit}>
          <input
            name="text.a[0].b"
            defaultValue={defaultNestedValue.text.a[0].b}
          />
        </Form>
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(defaultNestedValue)
      );
    });
  });

  describe("handle change", () => {
    it.each(["text", "number", "range"])(
      "should handle %s change correctly",
      async (type) => {
        render(
          <Form defaultValues={{ foo: "" }} onSubmit={onSubmit}>
            <input data-testid="foo" name="foo" type={type} />
          </Form>
        );
        const values: any = {
          text: "🍎",
          number: 1,
          range: 10,
        };
        fireEvent.input(screen.getByTestId("foo"), {
          target: { value: values[type] },
        });
        fireEvent.submit(screen.getByTestId("form"));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({ foo: values[type] })
        );
      }
    );

    it("should handle checkbox change correctly", async () => {
      render(
        <Form defaultValues={{ foo: false }} onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" type="checkbox" />
        </Form>
      );
      userEvent.click(screen.getByTestId("foo"));
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: true }));
    });

    it("should handle checkboxes change correctly", async () => {
      render(
        <Form defaultValues={{ foo: [] }} onSubmit={onSubmit}>
          <input data-testid="foo-0" name="foo" type="checkbox" value="🍎" />
          <input data-testid="foo-1" name="foo" type="checkbox" value="🍋" />
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo0 = screen.getByTestId("foo-0") as HTMLInputElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLInputElement;

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo0.value] })
      );

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo0.value, foo1.value] })
      );

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo1.value] })
      );

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: [] }));
    });

    it("should handle radio buttons change correctly", async () => {
      render(
        <Form defaultValues={{ foo: "" }} onSubmit={onSubmit}>
          <input data-testid="foo-0" name="foo" type="radio" value="🍎" />
          <input data-testid="foo-1" name="foo" type="radio" value="🍋" />
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo0 = screen.getByTestId("foo-0") as HTMLInputElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLInputElement;

      userEvent.click(foo0);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo0.value })
      );

      userEvent.click(foo1);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo1.value })
      );
    });

    it("should handle textarea change correctly", async () => {
      render(
        <Form defaultValues={{ foo: "" }} onSubmit={onSubmit}>
          <textarea data-testid="foo" name="foo" />
        </Form>
      );
      const value = "🍎";
      fireEvent.input(screen.getByTestId("foo"), {
        target: { value },
      });
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    });

    it("should handle select change correctly", async () => {
      render(
        <Form defaultValues={{ foo: "" }} onSubmit={onSubmit}>
          <select data-testid="foo" name="foo">
            <option data-testid="foo-0" value="🍎">
              🍎
            </option>
            <option data-testid="foo-1" value="🍋">
              🍋
            </option>
          </select>
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const foo0 = screen.getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLOptionElement;

      fireEvent.input(foo, { target: { value: foo0.value } });
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo0.value })
      );

      fireEvent.input(foo, { target: { value: foo1.value } });
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: foo1.value })
      );
    });

    it("should handle multiple select change correctly", async () => {
      render(
        <Form defaultValues={{ foo: [] }} onSubmit={onSubmit}>
          <select data-testid="foo" name="foo" multiple>
            <option data-testid="foo-0" value="🍎">
              🍎
            </option>
            <option data-testid="foo-1" value="🍋">
              🍋
            </option>
          </select>
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const foo0 = screen.getByTestId("foo-0") as HTMLOptionElement;
      const foo1 = screen.getByTestId("foo-1") as HTMLOptionElement;

      let value = [foo0.value];
      userEvent.selectOptions(foo, value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );

      value = [foo0.value, foo1.value];
      userEvent.selectOptions(foo, value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );

      userEvent.deselectOptions(foo, foo0.value);
      fireEvent.submit(form);
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: [foo1.value] })
      );

      userEvent.deselectOptions(foo, foo1.value);
      fireEvent.submit(form);
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: [] }));
    });

    it("should handle file change correctly", async () => {
      render(
        <Form defaultValues={{ foo: null }} onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" type="file" />
        </Form>
      );
      userEvent.upload(
        screen.getByTestId("foo"),
        new File(["🍎"], "🍎.png", { type: "image/png" })
      );
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          foo: {
            "0": expect.any(Object),
            item: expect.any(Function),
            length: 1,
          },
        })
      );
    });

    it("should handle files change correctly", async () => {
      render(
        <Form defaultValues={{ foo: null }} onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" type="file" multiple />
        </Form>
      );
      userEvent.upload(screen.getByTestId("foo"), [
        new File(["🍎"], "🍎.png", { type: "image/png" }),
        new File(["🍋"], "🍋.png", { type: "image/png" }),
      ]);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({
          foo: {
            "0": expect.any(Object),
            "1": expect.any(Object),
            item: expect.any(Function),
            length: 2,
          },
        })
      );
    });
  });

  describe("validation", () => {
    const onError = jest.fn();

    beforeEach(() => {
      onError.mockClear();
    });

    it("should run built-in validation", async () => {
      render(
        <Form defaultValues={{ foo: "" }} onError={onError}>
          <input data-testid="foo" name="foo" required />
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const errors = { foo: expect.anything() };

      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenNthCalledWith(1, errors));

      fireEvent.input(foo, { target: { value: "🍎" } });
      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

      fireEvent.input(foo, { target: { value: "" } });
      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenNthCalledWith(2, errors));
    });

    it("should run built-in validation with state mode", async () => {
      render(
        <Form
          defaultValues={{ foo: "" }}
          builtInValidationMode="state"
          onError={onError}
        >
          <input data-testid="foo" name="foo" required />
        </Form>
      );
      const form = screen.getByTestId("form");
      const foo = screen.getByTestId("foo");
      const errors = { foo: "valueMissing" };

      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenNthCalledWith(1, errors));

      fireEvent.input(foo, { target: { value: "🍎" } });
      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

      fireEvent.input(foo, { target: { value: "" } });
      fireEvent.submit(form);
      await waitFor(() => expect(onError).toHaveBeenNthCalledWith(2, errors));
    });
  });

  describe("exclude fields", () => {
    const defaultValues = { foo: "🍋" };
    const e = { target: { value: "🍎" } };

    it("should exclude a field via excludeFields option", async () => {
      render(
        <Form
          defaultValues={defaultValues}
          excludeFields={["foo"]}
          onSubmit={onSubmit}
        >
          <input data-testid="foo" name="foo" />
        </Form>
      );
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      expect(foo.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });

    it("should exclude a field via data attribute", async () => {
      render(
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          <input data-testid="foo" name="foo" data-rcf-exclude />
        </Form>
      );
      const foo = screen.getByTestId("foo") as HTMLInputElement;
      expect(foo.value).toBe("");
      fireEvent.input(foo, e);
      fireEvent.submit(screen.getByTestId("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValues));
    });
  });
});

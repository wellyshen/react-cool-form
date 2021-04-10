/* eslint-disable react/no-unused-prop-types */

import { Dispatch, forwardRef, useState } from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormConfig, FormMethods } from "./types";
import { isFunction } from "./utils";
import useForm from "./useForm";
import useFieldArray from "./useFieldArray";
import useControlled from "./useControlled";

type API = Omit<FormMethods, "form"> & {
  show?: boolean;
  setShow: Dispatch<boolean>;
};

interface Props extends FormConfig {
  children: JSX.Element | ((api: API) => JSX.Element);
  isShow?: boolean;
  isFieldArray?: boolean;
  onSubmit?: (values: any) => void;
  onError?: (errors: any) => void;
  onReset?: (values: any) => void;
}

const Form = ({
  children,
  id,
  isShow,
  isFieldArray,
  onSubmit = () => null,
  onError = () => null,
  onReset = () => null,
  ...config
}: Props) => {
  const [show, setShow] = useState(isShow);
  const { form, ...methods } = useForm({
    id,
    ...config,
    onSubmit: (values) => onSubmit(values),
    onError: (errors) => onError(errors),
    onReset: (values) => onReset(values),
  });
  useFieldArray(isFieldArray ? "foo" : "x", { formId: id });

  return (
    <>
      <form data-testid="form" ref={form}>
        {isFunction(children)
          ? children({ ...methods, show, setShow })
          : children}
      </form>
    </>
  );
};

const renderHelper = ({ children, ...rest }: Props) => {
  let api: API;

  render(
    <Form {...rest}>
      {(a) => {
        api = a;
        return isFunction(children) ? children(a) : children;
      }}
    </Form>
  );

  // @ts-expect-error
  return api;
};

const Field = forwardRef(
  ({ name = "foo", onProps, onMeta, ...rest }: any, ref: any) => {
    const [props, meta] = useControlled(name, { "data-testid": name, ...rest });
    if (onProps) onProps(props);
    if (onMeta) onMeta(meta);
    return <input {...props} ref={ref} />;
  }
);

const CustomField = () => {
  const [{ onChange, value }] = useControlled("foo");
  return (
    <button
      data-testid="foo"
      type="button"
      onClick={(e: any) => onChange(e.target.value)}
    >
      {value}
    </button>
  );
};

describe("useControlled", () => {
  console.warn = jest.fn();
  const getByTestId = screen.getByTestId as any;
  const onSubmit = jest.fn();
  const onError = jest.fn();
  const onReset = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("should throw missing name error", () => {
    // @ts-expect-error
    expect(() => useControlled()).toThrow(
      '💡 react-cool-form > useControlled: Missing "name" parameter.'
    );
  });

  it("should throw form id errors", () => {
    expect(() => useControlled("foo", { formId: "form-1" })).toThrow(
      '💡 react-cool-form > useControlled: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
    );
  });

  it("should warn missing default value", () => {
    renderHelper({ children: <Field /> });
    fireEvent.input(getByTestId("foo"), { target: { value: "🍎" } });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '💡 react-cool-form > useControlled: Please provide a default value for "foo" field.'
    );
  });

  it("should not warn missing default value for field-array", () => {
    renderHelper({ isFieldArray: true, children: <Field /> });
    fireEvent.input(getByTestId("foo"), { target: { value: "🍎" } });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it.each(["form", "controlled"])(
    "should not warn missing default value",
    (type) => {
      renderHelper({
        defaultValues: type === "form" ? { foo: "🍎" } : undefined,
        children: (
          <Field defaultValue={type === "controlled" ? "🍎" : undefined} />
        ),
      });
      expect(console.warn).not.toHaveBeenCalled();
    }
  );

  it("should return values correctly", () => {
    const onProps = jest.fn();
    const onMeta = jest.fn();
    renderHelper({
      children: <Field onProps={onProps} onMeta={onMeta} defaultValue="🍎" />,
    });
    expect(onProps).toHaveBeenCalledWith({
      "data-testid": expect.any(String),
      name: expect.any(String),
      value: expect.any(String),
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
    });
    expect(onMeta).toHaveBeenCalledWith({
      isTouched: expect.any(Boolean),
      isDirty: expect.any(Boolean),
    });
  });

  it("should call events correctly", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    renderHelper({ children: <Field onChange={onChange} onBlur={onBlur} /> });
    fireEvent.input(getByTestId("foo"), { target: { value: "🍎" } });
    expect(onChange).toHaveBeenCalled();
    fireEvent.focusOut(getByTestId("foo"));
    expect(onBlur).toHaveBeenCalled();
  });

  it.each(["form", "controlled"])(
    "should set default value correctly from %s option",
    async (type) => {
      const value = "🍎";
      const format = jest.fn(() => value);
      renderHelper({
        defaultValues: type === "form" ? { foo: value } : undefined,
        onSubmit,
        children: (
          <Field
            format={format}
            defaultValue={type === "controlled" ? value : undefined}
          />
        ),
      });
      expect(format).toHaveBeenCalledWith(value);
      expect(getByTestId("foo").value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it("should not set default value", () => {
    const { getState } = renderHelper({ children: <Field /> });
    expect(getState("foo")).toBeUndefined();
  });

  it.each(["form", "controlled"])(
    "should set default value correctly from %s option for field-array",
    async (type) => {
      const value = "🍎";
      const format = jest.fn(() => value);
      renderHelper({
        isFieldArray: true,
        defaultValues: type === "form" ? { foo: value } : undefined,
        onSubmit,
        children: (
          <Field
            format={format}
            defaultValue={type === "controlled" ? value : undefined}
          />
        ),
      });
      expect(format).toHaveBeenCalledWith(value);
      expect(getByTestId("foo").value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it.each([true, false])(
    "should use form-level default value first",
    async (isFieldArray) => {
      const value = "🍎";
      const format = jest.fn(() => value);
      renderHelper({
        isFieldArray,
        defaultValues: { foo: value },
        onSubmit,
        children: <Field format={format} defaultValue="🍋" />,
      });
      expect(format).toHaveBeenCalledWith(value);
      expect(getByTestId("foo").value).toBe(value);
      fireEvent.submit(getByTestId("form"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ foo: value })
      );
    }
  );

  it("should not set default value for field-array", () => {
    const { getState } = renderHelper({
      isFieldArray: true,
      children: <Field />,
    });
    expect(getState("foo")).toBeUndefined();
  });

  it.each(["form", "controlled"])(
    "should reset value correctly from %s option",
    (type) => {
      const defaultValues = { foo: "🍎" };
      const { reset } = renderHelper({
        defaultValues: type === "form" ? defaultValues : undefined,
        onReset,
        children: (
          <Field
            defaultValue={type === "controlled" ? defaultValues.foo : undefined}
          />
        ),
      });
      act(() => reset());
      expect(onReset).toHaveBeenCalledWith(defaultValues);
    }
  );

  it.each(["form", "controlled"])(
    "should reset value correctly from %s option for field-array",
    (type) => {
      const defaultValues = { foo: "🍎" };
      const { reset } = renderHelper({
        isFieldArray: true,
        defaultValues: type === "form" ? defaultValues : undefined,
        onReset,
        children: (
          <Field
            defaultValue={type === "controlled" ? defaultValues.foo : undefined}
          />
        ),
      });
      act(() => reset());
      expect(onReset).toHaveBeenCalledWith(
        type === "controlled" ? {} : defaultValues
      );
    }
  );

  it.each(["form", "controlled"])(
    "should reset value correctly from %s option for field-array",
    (type) => {
      const defaultValues = { foo: "🍎" };
      const { reset } = renderHelper({
        isFieldArray: true,
        defaultValues: type === "form" ? defaultValues : undefined,
        onReset,
        children: (
          <Field
            defaultValue={type === "controlled" ? defaultValues.foo : undefined}
          />
        ),
      });
      act(() => reset());
      expect(onReset).toHaveBeenCalledWith(
        type === "controlled" ? {} : defaultValues
      );
    }
  );

  it("should run validation on submit", async () => {
    const onMeta = jest.fn();
    const errors = { foo: "Required" };
    const { getState } = renderHelper({
      onSubmit,
      onError,
      children: (
        <Field
          onMeta={onMeta}
          validate={async (val: string) => (!val.length ? errors.foo : false)}
          defaultValue=""
        />
      ),
    });

    fireEvent.submit(getByTestId("form"));
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => expect(onError).toHaveBeenCalledWith(errors));
    expect(onMeta).toHaveBeenLastCalledWith({
      error: errors.foo,
      isTouched: expect.any(Boolean),
      isDirty: expect.any(Boolean),
    });
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeFalsy();

    const value = "🍎";
    fireEvent.input(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    expect(getState("isValidating")).toBeTruthy();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ foo: value });
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(onMeta).toHaveBeenLastCalledWith({
      isTouched: expect.any(Boolean),
      isDirty: expect.any(Boolean),
    });
    expect(getState("errors")).toEqual({});
    expect(getState("isValidating")).toBeFalsy();
    expect(getState("isValid")).toBeTruthy();
  });

  it("should run validation on change", async () => {
    const error = "Too short";
    const { getState } = renderHelper({
      children: (
        <Field
          validate={(val: string) => (val.length < 5 ? error : false)}
          defaultValue=""
        />
      ),
    });
    fireEvent.input(getByTestId("foo"), { target: { value: "123" } });
    await waitFor(() => expect(getState("errors")).toEqual({ foo: error }));
  });

  it("should run validation on blur", async () => {
    const error = "Required";
    const { getState } = renderHelper({
      children: (
        <Field
          validate={(val: string) => (!val.length ? error : false)}
          defaultValue=""
        />
      ),
    });
    fireEvent.focusOut(getByTestId("foo"));
    await waitFor(() => expect(getState("errors")).toEqual({ foo: error }));
  });

  it('should ignore "field" method', async () => {
    const mockDate = "2050-01-09";
    renderHelper({
      onSubmit,
      onError,
      children: ({ field }: API) => (
        <Field
          type="date"
          ref={field({ validate: () => "Required", valueAsNumber: true })}
          defaultValue={mockDate}
        />
      ),
    });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ foo: mockDate });
      expect(onError).not.toHaveBeenCalled();
    });
  });

  it.each([undefined, "form-1"])("should work with form ID", async (formId) => {
    renderHelper({
      id: formId,
      onSubmit,
      children: <Field formId={formId} />,
    });
    const value = "🍎";
    fireEvent.input(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: value }));
  });

  it("should handle text correctly", async () => {
    renderHelper({
      onSubmit,
      children: <input data-testid="text" name="text" />,
    });
    const value = "🍎";
    fireEvent.input(getByTestId("text"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ text: value }));
  });

  it("should handle checkboxes correctly", async () => {
    renderHelper({
      onSubmit,
      children: (
        <>
          <Field
            data-testid="checkboxes-0"
            name="checkboxes"
            type="checkbox"
            value="🍎"
          />
          <Field name="checkboxes" type="checkbox" value="🍋" />
        </>
      ),
    });
    const checkboxes0 = getByTestId("checkboxes-0");
    userEvent.click(checkboxes0);
    fireEvent.submit(getByTestId("form"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ checkboxes: [checkboxes0.value] })
    );
  });

  it("should handle multiple select correctly", async () => {
    renderHelper({
      onSubmit,
      children: (
        <select data-testid="selects" name="selects" multiple>
          <option data-testid="selects-0" value="🍎">
            🍎
          </option>
          <option value="🍋">🍋</option>
        </select>
      ),
    });
    const selects0 = getByTestId("selects-0");
    userEvent.selectOptions(getByTestId("selects"), [selects0.value]);
    fireEvent.submit(getByTestId("form"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ selects: [selects0.value] })
    );
  });

  it("should handle custom field correctly", async () => {
    renderHelper({
      onSubmit,
      children: <CustomField />,
    });
    const value = "🍎";
    fireEvent.click(getByTestId("foo"), { target: { value } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: value }));
  });

  it("should parse value correctly", async () => {
    renderHelper({
      onSubmit,
      children: <Field parse={({ target }: any) => `${target.value}🍋`} />,
    });
    fireEvent.input(getByTestId("foo"), { target: { value: "🍎" } });
    fireEvent.submit(getByTestId("form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: "🍎🍋" }));
  });

  it("should format value correctly", () => {
    renderHelper({
      onSubmit,
      children: (
        <Field
          format={(val: string) => val.replace("🍋", "")}
          defaultValue="🍎🍋"
        />
      ),
    });
    expect(getByTestId("foo").value).toBe("🍎");
  });

  describe("conditional fields", () => {
    const initialState = {
      values: {},
      touched: {},
      errors: {},
      isDirty: false,
      dirty: {},
      isValidating: false,
      isValid: true,
      isSubmitting: false,
      isSubmitted: false,
      submitCount: 0,
    };

    it.each(["form", "field"])(
      "should set %s-level default value correctly",
      async (type) => {
        const formValue = "🍎";
        const fieldValue = "🍋";
        const {
          getState,
          setError,
          setTouched,
          setDirty,
          setShow,
        } = renderHelper({
          defaultValues: type === "form" ? { foo: formValue } : undefined,
          children: ({ show }: API) => (
            <>
              {show && (
                <Field
                  defaultValue={type === "field" ? fieldValue : undefined}
                />
              )}
            </>
          ),
        });

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState("foo")).toBe(
            type === "form" ? formValue : fieldValue
          );
          expect(getByTestId("foo").value).toBe(
            type === "form" ? formValue : fieldValue
          );
        });

        act(() => {
          setError("foo", "Required");
          setTouched("foo", true, false);
          setDirty("foo");
          setShow(false);
        });
        await waitFor(() => expect(getState()).toEqual(initialState));

        act(() => setShow(true));
        await waitFor(() => {
          expect(getState()).toEqual({
            ...initialState,
            values: { foo: type === "field" ? fieldValue : undefined },
          });
          expect(getByTestId("foo").value).toBe(
            type === "field" ? fieldValue : ""
          );
        });
      }
    );

    it("should not remove field", async () => {
      const value = "🍎";
      const {
        getState,
        setError,
        setTouched,
        setDirty,
        setShow,
      } = renderHelper({
        isShow: true,
        shouldRemoveField: false,
        children: ({ show }: API) => (
          <>{show && <Field defaultValue={value} />}</>
        ),
      });

      act(() => {
        setError("foo", "Required");
        setTouched("foo", true, false);
        setDirty("foo");
        setShow(false);
      });
      await waitFor(() =>
        expect(getState()).toEqual({
          ...initialState,
          values: { foo: value },
          errors: { foo: "Required" },
          isValid: false,
          touched: { foo: true },
          dirty: { foo: true },
          isDirty: true,
        })
      );

      act(() => setShow(true));
      await waitFor(() => expect(getByTestId("foo").value).toBe(value));
    });
  });
});

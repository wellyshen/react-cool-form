import { createContext, useState, useContext } from "react";

const Context = createContext();

const FormValuesProvider = ({ children }) => {
  const [formValues, setFormValues] = useState({});

  return (
    <Context.Provider value={[formValues, setFormValues]}>
      {children}
    </Context.Provider>
  );
};

const useFormValues = () => useContext(Context);

export { FormValuesProvider, useFormValues };

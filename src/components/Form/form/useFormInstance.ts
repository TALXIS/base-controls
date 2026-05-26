import { useContext } from "react";
import { FormModel } from "./FormModel";
import { FormContext } from "./FormContext";

/**
 * Returns the `FormModel` instance for the surrounding `<Form>`. Use inside
 * children passed to `<Form>` in codeful mode to register fields and call
 * `getValue` / `setValue` against the underlying `IRecord`.
 */
export const useFormInstance = (): FormModel => {
    return useContext(FormContext);
};

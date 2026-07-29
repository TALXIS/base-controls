import React from "react";
import { useFormContext } from "./context";
import { IValidation } from "@components/Form/internal/FormModel";
import { useEventEmitter } from "@hooks";

export const useValidationSummary = (): IValidation[] => {
    const form = useFormContext();
    const [validationSummary, setValidationSummary] = React.useState<IValidation[]>(form.getValidationSummary());

    useEventEmitter(form.events, 'onAfterSave', () => setValidationSummary(form.getValidationSummary()));

    return validationSummary;
}

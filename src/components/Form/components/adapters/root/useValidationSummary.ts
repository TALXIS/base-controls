import React from "react";
import { useForm } from "./context";
import { IValidation } from "@components/Form/internal/FormModel";
import { useEventEmitter } from "@hooks";

export const useValidationSummary = (): IValidation[] => {
    const form = useForm();
    const [validationSummary, setValidationSummary] = React.useState<IValidation[]>(form.getValidationSummary());

    useEventEmitter(form.events, 'onAfterSave', () => setValidationSummary(form.getValidationSummary()));

    return validationSummary;
}

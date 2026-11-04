import React from "react";
import { useForm } from "./context";
import { IValidation } from "../../interfaces";
import { useEventEmitter, useRerender } from "@core";

export const useValidationSummary = (): IValidation[] => {
    const form = useForm();
    const { rerender } = useRerender();

    useEventEmitter(form.events, 'onValidationSummaryChanged', rerender);

    return form.getValidationSummary()
}

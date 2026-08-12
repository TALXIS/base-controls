import React from "react";
import { useForm } from "./context";
import { IValidation } from "@components/Form/interfaces";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";

export const useValidationSummary = (): IValidation[] => {
    const form = useForm();
    const rerender = useRerender();

    useEventEmitter(form.events, 'onValidationSummaryChanged', rerender);

    return form.getValidationSummary()
}

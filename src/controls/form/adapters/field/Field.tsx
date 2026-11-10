import { RequiredLevelEnum } from "@talxis/client-metadata";
import { FieldContext } from "./context";
import { IFieldValidationResult } from "@talxis/client-libraries";
import React from "react";
import { useForm } from "../root/context";

export interface IFieldProps {
    name?: string;
    requiredLevel?: RequiredLevelEnum | null;
    validation?: IFieldValidationResult | null;
    children?: React.ReactNode;
}

export const Field = (props: IFieldProps) => {
    const form = useForm();
    const { name, requiredLevel, validation, children } = props;

    React.useEffect(() => {
        if (!name) {
            return;
        }

        if (requiredLevel !== undefined) {
            form.setFieldRequiredLevel(name, requiredLevel);
        }

        if (validation !== undefined) {
            form.setFieldValid(name, validation);
        }
    }, [name, requiredLevel, validation]);

    return <FieldContext.Provider value={name ?? null}>
        {children}
    </FieldContext.Provider>
}

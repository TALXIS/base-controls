import React from "react";
import { IForm } from "../../Form";
import { IRecord } from "@talxis/client-libraries";

export const FormContext = React.createContext<IForm | null>(null);
export const RecordContext = React.createContext<IRecord | null>(null);

export const useFormContext = (): IForm => {
    const context = React.useContext(FormContext);
    if(!context) {
        throw new Error("useFormContext must be used within a FormContext.Provider");
    }
    return context;
}

export const useRecordContext = (): IRecord | null => {
    return React.useContext(RecordContext);
}
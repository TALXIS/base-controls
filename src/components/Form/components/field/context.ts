import React from "react";
import { IField } from "@talxis/client-libraries";

export const FieldContext = React.createContext<IField | null>(null);

export const useFieldContext = (): IField | null => {
    return React.useContext(FieldContext);
}
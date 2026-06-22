import { createContext } from "react";
import { FormModel } from "./FormModel";

export const FormContext = createContext<FormModel>(null as any);

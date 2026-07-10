import React, { useContext } from "react";
import { IFormComponents } from "./components/components";

import { FormComponents } from "./components/components";

export const FormComponentsContext = React.createContext<IFormComponents>(FormComponents);

export const useFormComponents = () => {
    return useContext(FormComponentsContext);
}
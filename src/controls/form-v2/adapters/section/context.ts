import React from "react";
import type { IFormSection } from "../../runtime/parts/section/FormSection";

export const FormSectionContext = React.createContext<IFormSection | undefined>(undefined);

/** The section the component is drawn in, if any. */
export const useOptionalFormSection = (): IFormSection | undefined => {
    return React.useContext(FormSectionContext);
};

/** The section the component is drawn in; throws outside one. */
export const useFormSection = (): IFormSection => {
    const section = useOptionalFormSection();
    if (!section) {
        throw new Error('A section part needs a FormV2.Section above it.');
    }
    return section;
};

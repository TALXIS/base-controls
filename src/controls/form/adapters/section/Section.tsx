import { usePcfContext } from "@pcf";
import { FormUi, IFormUiSectionProps } from "../../ui";

export type { IFormUiSectionProps } from "../../ui";

export const Section = (props: IFormUiSectionProps) => {
    return <FormUi.Section {...props} />;
};

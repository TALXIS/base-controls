import { FormUi, ISectionProps } from "../../ui";

export type { ISectionProps } from "../../ui";

export const Section = (props: ISectionProps) => {
    return <FormUi.Section {...props} />;
};

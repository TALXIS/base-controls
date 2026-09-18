import { usePcfContext } from "@utils";
import { FormUi, ISectionProps } from "@controls/form/components/ui";

export type { ISectionProps } from "@controls/form/components/ui";

export const Section = (props: ISectionProps) => {
    return <FormUi.Section {...props} />;
};

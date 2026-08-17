import { usePcfContext } from "@utils";
import { FormUi, ISectionProps } from "@components/Form/components/ui";

export type { ISectionProps } from "@components/Form/components/ui";

export const Section = (props: ISectionProps) => {
    return <FormUi.Section {...props} />;
};

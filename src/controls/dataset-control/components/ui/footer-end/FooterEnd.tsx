import { useMemo } from "react";
import { getClassNames } from "@utils";
import { FooterEndUiComponents, IFooterEndUiComponents } from "./components";
import { getFooterEndUiStyles } from "./styles";

/** Props for the footer's end region, as plain UI. */
export interface IFooterEndUiProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IFooterEndUiComponents>;
}

/** The footer's right region, taking the rest of the row with its content against the right edge. */
export const FooterEnd = (props: IFooterEndUiProps) => {
    const components = { ...FooterEndUiComponents, ...props.components };
    const styles = useMemo(() => getFooterEndUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlFooterEnd, props.className]), children: props.children });
};

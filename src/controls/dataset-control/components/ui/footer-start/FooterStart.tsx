import { useMemo } from "react";
import { getClassNames } from "@utils";
import { FooterStartUiComponents, IFooterStartUiComponents } from "./components";
import { getFooterStartUiStyles } from "./styles";

/** Props for the footer's start region, as plain UI. */
export interface IFooterStartUiProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IFooterStartUiComponents>;
}

/** The footer's left region, sized to what it holds. */
export const FooterStart = (props: IFooterStartUiProps) => {
    const components = { ...FooterStartUiComponents, ...props.components };
    const styles = useMemo(() => getFooterStartUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlFooterStart, props.className]), children: props.children });
};

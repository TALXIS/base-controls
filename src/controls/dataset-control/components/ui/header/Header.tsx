import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderUiComponents, IHeaderUiComponents } from "./components";
import { getHeaderUiStyles } from "./styles";

/** Props for the header, as plain UI. */
export interface IHeaderUiProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** The widest header, in pixels, whose parts draw compact. Defaults to `DEFAULT_MAX_COMPACT_WIDTH`. */
    maxCompactWidth?: number;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IHeaderUiComponents>;
}

/** The row above the records, holding the view switcher, ribbon, quick find and other commands. */
export const Header = (props: IHeaderUiProps) => {
    const components = { ...HeaderUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeader, props.className]), maxCompactWidth: props.maxCompactWidth, children: props.children });
};

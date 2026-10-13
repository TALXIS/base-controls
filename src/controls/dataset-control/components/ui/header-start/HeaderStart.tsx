import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderStartUiComponents, IHeaderStartUiComponents } from "./components";
import { getHeaderStartUiStyles } from "./styles";

/** Props for the header's start region, as plain UI. */
export interface IHeaderStartUiProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IHeaderStartUiComponents>;
}

/** The header's left region, sized to what it holds. */
export const HeaderStart = (props: IHeaderStartUiProps) => {
    const components = { ...HeaderStartUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderStartUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeaderStart, props.className]), children: props.children });
};

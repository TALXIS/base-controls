import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderEndUiComponents, IHeaderEndUiComponents } from "./components";
import { getHeaderEndUiStyles } from "./styles";

/** Props for the header's end region, as plain UI. */
export interface IHeaderEndUiProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IHeaderEndUiComponents>;
}

/** The header's right region, taking the rest of the row with its content against the right edge. */
export const HeaderEnd = (props: IHeaderEndUiProps) => {
    const components = { ...HeaderEndUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderEndUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeaderEnd, props.className]), children: props.children });
};

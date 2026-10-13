import { useMemo } from "react";
import { getClassNames } from "@utils";
import { BodyUiComponents, IBodyUiComponents } from "./components";
import { getBodyUiStyles } from "./styles";

/** Props for the body, as plain UI. */
export interface IBodyUiProps {
    /** What shows the records. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IBodyUiComponents>;
}

/** What fills the height the header and footer leave, usually the grid. */
export const Body = (props: IBodyUiProps) => {
    const components = { ...BodyUiComponents, ...props.components };
    const styles = useMemo(() => getBodyUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlBody, props.className]), children: props.children });
};

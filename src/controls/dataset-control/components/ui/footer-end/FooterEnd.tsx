import { useMemo } from "react";
import { getClassNames } from "@utils";
import { FooterEndUiComponents, IFooterEndUiComponents } from "./components";
import { getFooterEndUiStyles } from "./styles";

export interface IFooterEndUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IFooterEndUiComponents>;
}

/** The footer's right region, taking the rest of the row with its content against the right edge. */
export const FooterEnd = (props: IFooterEndUiProps) => {
    const components = { ...FooterEndUiComponents, ...props.components };
    const styles = useMemo(() => getFooterEndUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlFooterEnd, props.className]), children: props.children });
};

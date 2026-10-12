import { useMemo } from "react";
import { getClassNames } from "@utils";
import { FooterStartUiComponents, IFooterStartUiComponents } from "./components";
import { getFooterStartUiStyles } from "./styles";

export interface IFooterStartUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IFooterStartUiComponents>;
}

/** The footer's left region, sized to what it holds. */
export const FooterStart = (props: IFooterStartUiProps) => {
    const components = { ...FooterStartUiComponents, ...props.components };
    const styles = useMemo(() => getFooterStartUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlFooterStart, props.className]), children: props.children });
};

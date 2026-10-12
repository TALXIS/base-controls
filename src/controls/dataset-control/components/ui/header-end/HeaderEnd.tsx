import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderEndUiComponents, IHeaderEndUiComponents } from "./components";
import { getHeaderEndUiStyles } from "./styles";

export interface IHeaderEndUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderEndUiComponents>;
}

/** The header's right region, taking the rest of the row with its content against the right edge. */
export const HeaderEnd = (props: IHeaderEndUiProps) => {
    const components = { ...HeaderEndUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderEndUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeaderEnd, props.className]), children: props.children });
};

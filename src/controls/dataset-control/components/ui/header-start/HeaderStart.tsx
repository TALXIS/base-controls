import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderStartUiComponents, IHeaderStartUiComponents } from "./components";
import { getHeaderStartUiStyles } from "./styles";

export interface IHeaderStartUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderStartUiComponents>;
}

/** The header's left region, sized to what it holds. */
export const HeaderStart = (props: IHeaderStartUiProps) => {
    const components = { ...HeaderStartUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderStartUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeaderStart, props.className]), children: props.children });
};

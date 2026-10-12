import { useMemo } from "react";
import { getClassNames } from "@utils";
import { HeaderUiComponents, IHeaderUiComponents } from "./components";
import { getHeaderUiStyles } from "./styles";

export interface IHeaderUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderUiComponents>;
}

/** The row above the records, holding the view switcher, ribbon, quick find and other commands. */
export const Header = (props: IHeaderUiProps) => {
    const components = { ...HeaderUiComponents, ...props.components };
    const styles = useMemo(() => getHeaderUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeader, props.className]), children: props.children });
};

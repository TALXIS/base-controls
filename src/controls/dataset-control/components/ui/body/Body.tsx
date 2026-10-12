import { useMemo } from "react";
import { getClassNames } from "@utils";
import { BodyUiComponents, IBodyUiComponents } from "./components";
import { getBodyUiStyles } from "./styles";

export interface IBodyUiProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IBodyUiComponents>;
}

/** What fills the height the header and footer leave, usually the grid. */
export const Body = (props: IBodyUiProps) => {
    const components = { ...BodyUiComponents, ...props.components };
    const styles = useMemo(() => getBodyUiStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlBody, props.className]), children: props.children });
};

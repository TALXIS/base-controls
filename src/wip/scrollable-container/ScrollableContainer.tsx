import { useMemo } from "react";
import { IScrollableContainerComponents } from "./components";
import { components as defaultComponents } from "./components";
import { getScrollableContainerStyles } from "./styles";

export interface IScrollableContainerProps {
    children?: React.ReactNode;
    components?: Partial<IScrollableContainerComponents>;
}

export const ScrollableContainer = (props: IScrollableContainerProps) => {
    const components = { ...defaultComponents, ...props.components };
    const styles = useMemo(() => getScrollableContainerStyles(), []);

    return <components.Container className={styles.scrollableContainer}>
        {props.children}
    </components.Container>
}
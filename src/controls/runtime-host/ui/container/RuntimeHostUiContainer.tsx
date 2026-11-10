import { useMemo } from "react";
import { IRuntimeHostUiContainerComponents, RuntimeHostUiContainerComponents } from "./components";
import { getRuntimeHostUiContainerStyles } from "./styles";

export interface IRuntimeHostUiContainerProps {
    children?: React.ReactNode;
    components?: Partial<IRuntimeHostUiContainerComponents>;
}

/** The box a runtime is drawn in, which its loading overlay covers. */
export const RuntimeHostUiContainer = (props: IRuntimeHostUiContainerProps) => {
    const components = { ...RuntimeHostUiContainerComponents, ...props.components };
    const styles = useMemo(() => getRuntimeHostUiContainerStyles(), []);
    return components.onRenderContainer({ className: styles.container, children: props.children });
};

import { useMemo } from "react";
import { getClassNames } from "@core";
import { IRuntimeHostUiContainerComponents, RuntimeHostUiContainerComponents } from "./components";
import { getRuntimeHostUiContainerStyles } from "./styles";

export interface IRuntimeHostUiContainerProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IRuntimeHostUiContainerComponents>;
}

/** The box a runtime is drawn in, which its loading overlay covers. */
export const RuntimeHostUiContainer = (props: IRuntimeHostUiContainerProps) => {
    const components = { ...RuntimeHostUiContainerComponents, ...props.components };
    const styles = useMemo(() => getRuntimeHostUiContainerStyles(), []);
    return components.onRender({ className: getClassNames([styles.runtime, props.className]), children: props.children });
};

import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardHeaderStartComponents, CardHeaderStartComponents } from "./components";
import { getCardHeaderStartStyles } from "./styles";

export interface ICardHeaderStartProps {
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardHeaderStartComponents>;
}

/** The header's start, taking the width the end leaves; it holds the title. */
export const CardHeaderStart = (props: ICardHeaderStartProps) => {
    const components = { ...CardHeaderStartComponents, ...props.components };
    const styles = useMemo(() => getCardHeaderStartStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardHeaderStart, props.className]), children: props.children });
};

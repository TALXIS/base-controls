import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardFooterStartComponents, CardFooterStartComponents } from "./components";
import { getCardFooterStartStyles } from "./styles";

export interface ICardFooterStartProps {
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardFooterStartComponents>;
}

/** The footer's start, such as a status or a hint. */
export const CardFooterStart = (props: ICardFooterStartProps) => {
    const components = { ...CardFooterStartComponents, ...props.components };
    const styles = useMemo(() => getCardFooterStartStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardFooterStart, props.className]), children: props.children });
};

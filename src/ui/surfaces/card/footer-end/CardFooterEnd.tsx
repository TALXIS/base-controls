import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardFooterEndComponents, CardFooterEndComponents } from "./components";
import { getCardFooterEndStyles } from "./styles";

export interface ICardFooterEndProps {
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardFooterEndComponents>;
}

/** The footer's end, such as its buttons; it stays at the end when alone. */
export const CardFooterEnd = (props: ICardFooterEndProps) => {
    const components = { ...CardFooterEndComponents, ...props.components };
    const styles = useMemo(() => getCardFooterEndStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardFooterEnd, props.className]), children: props.children });
};

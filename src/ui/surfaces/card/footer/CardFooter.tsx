import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardFooterComponents, CardFooterComponents } from "./components";
import { getCardFooterStyles } from "./styles";

export interface ICardFooterProps {
    /** A `Card.Footer.Start` and a `Card.Footer.End`. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardFooterComponents>;
}

/** The row at the bottom of the card, its start and end apart. */
export const CardFooter = (props: ICardFooterProps) => {
    const components = { ...CardFooterComponents, ...props.components };
    const styles = useMemo(() => getCardFooterStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardFooter, props.className]), children: props.children });
};

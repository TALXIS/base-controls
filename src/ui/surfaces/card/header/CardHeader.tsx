import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardHeaderComponents, CardHeaderComponents } from "./components";
import { getCardHeaderStyles } from "./styles";

export interface ICardHeaderProps {
    /** A `Card.Header.Start` and a `Card.Header.End`. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardHeaderComponents>;
}

/** The row at the top of the card, its start and end apart. */
export const CardHeader = (props: ICardHeaderProps) => {
    const components = { ...CardHeaderComponents, ...props.components };
    const styles = useMemo(() => getCardHeaderStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardHeader, props.className]), children: props.children });
};

import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardBodyComponents, CardBodyComponents } from "./components";
import { getCardBodyStyles } from "./styles";

export interface ICardBodyProps {
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardBodyComponents>;
}

/** The card's content. */
export const CardBody = (props: ICardBodyProps) => {
    const components = { ...CardBodyComponents, ...props.components };
    const styles = useMemo(() => getCardBodyStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardBody, props.className]), children: props.children });
};

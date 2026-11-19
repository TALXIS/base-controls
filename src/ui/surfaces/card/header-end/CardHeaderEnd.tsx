import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { ICardHeaderEndComponents, CardHeaderEndComponents } from "./components";
import { getCardHeaderEndStyles } from "./styles";

export interface ICardHeaderEndProps {
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardHeaderEndComponents>;
}

/** The header's end, such as its buttons; it stays at the end when alone. */
export const CardHeaderEnd = (props: ICardHeaderEndProps) => {
    const components = { ...CardHeaderEndComponents, ...props.components };
    const styles = useMemo(() => getCardHeaderEndStyles(), []);
    return components.onRender({ className: getClassNames([styles.cardHeaderEnd, props.className]), children: props.children });
};

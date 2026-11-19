import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { ICardComponents, CardComponents } from "./components";
import { getCardStyles } from "./styles";

export interface ICardProps {
    /** A `Card.Header`, a `Card.Body` and a `Card.Footer`, in any combination. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardComponents>;
}

/** A box with the look of a form section, composed of a header, a body and a footer. */
export const CardRoot = (props: ICardProps) => {
    const components = { ...CardComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getCardStyles(theme), [theme]);
    return components.onRender({ className: getClassNames([styles.card, props.className]), children: props.children });
};

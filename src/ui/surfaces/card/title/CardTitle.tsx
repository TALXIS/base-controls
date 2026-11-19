import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { ICardTitleComponents, CardTitleComponents } from "./components";
import { getCardTitleStyles } from "./styles";

export interface ICardTitleProps {
    children?: ReactNode;
    /** Keeps the title on one line, cut off with an ellipsis; it wraps by default. */
    nowrap?: boolean;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ICardTitleComponents>;
}

/** The card's title. */
export const CardTitle = (props: ICardTitleProps) => {
    const components = { ...CardTitleComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getCardTitleStyles(theme, !!props.nowrap), [theme, props.nowrap]);
    return components.onRender({ className: getClassNames([styles.cardTitle, props.className]), children: props.children });
};

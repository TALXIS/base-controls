import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { FooterUiComponents, IFooterUiComponents } from "./components";
import { getFooterUiStyles } from "./styles";

/** Props for the footer, as plain UI. */
export interface IFooterUiProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IFooterUiComponents>;
}

/** The row below the records, holding the paging and the record count. */
export const Footer = (props: IFooterUiProps) => {
    const components = { ...FooterUiComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFooterUiStyles(theme), [theme]);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlFooter, props.className]), children: props.children });
};

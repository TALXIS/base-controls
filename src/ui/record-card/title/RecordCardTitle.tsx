import { ReactNode, useMemo } from "react";
import { useTheme } from "@theme";
import { IRecordCardTitleComponents, RecordCardTitleComponents } from "./components";
import { getRecordCardTitleStyles } from "./styles";

export interface IRecordCardTitleProps {
    children?: ReactNode;
    components?: Partial<IRecordCardTitleComponents>;
}

/** The card's title. */
export const RecordCardTitle = (props: IRecordCardTitleProps) => {
    const components = { ...RecordCardTitleComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getRecordCardTitleStyles(theme), [theme]);
    return components.onRender({ className: styles.title, children: props.children });
};

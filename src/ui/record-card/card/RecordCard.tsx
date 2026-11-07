import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { IRecordCardComponents, RecordCardComponents } from "./components";
import { getRecordCardStyles } from "./styles";

export interface IRecordCardProps {
    /** The header, the field rows and anything else the card shows. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IRecordCardComponents>;
}

/** The box a record's summary sits in, such as in a tooltip or a map popup. */
export const RecordCard = (props: IRecordCardProps) => {
    const components = { ...RecordCardComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getRecordCardStyles(theme), [theme]);
    return components.onRenderContainer({ className: getClassNames([styles.card, props.className]), children: props.children });
};

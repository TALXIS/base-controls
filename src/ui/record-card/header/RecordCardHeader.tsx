import { ReactNode, useMemo } from "react";
import { IRecordCardHeaderComponents, RecordCardHeaderComponents } from "./components";
import { getRecordCardHeaderStyles } from "./styles";

export interface IRecordCardHeaderProps {
    /** A `RecordCardHeaderStart` and a `RecordCardHeaderEnd`. */
    children?: ReactNode;
    components?: Partial<IRecordCardHeaderComponents>;
}

/** The row at the top of the card, its start and end apart. */
export const RecordCardHeader = (props: IRecordCardHeaderProps) => {
    const components = { ...RecordCardHeaderComponents, ...props.components };
    const styles = useMemo(() => getRecordCardHeaderStyles(), []);
    return components.onRender({ className: styles.header, children: props.children });
};

import { ReactNode, useMemo } from "react";
import { IRecordCardFieldRowsComponents, RecordCardFieldRowsComponents } from "./components";
import { getRecordCardFieldRowsStyles } from "./styles";

export interface IRecordCardFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowsComponents>;
}

/** The field rows, one under another. */
export const RecordCardFieldRows = (props: IRecordCardFieldRowsProps) => {
    const components = { ...RecordCardFieldRowsComponents, ...props.components };
    const styles = useMemo(() => getRecordCardFieldRowsStyles(), []);

    return components.onRenderContainer({ className: styles.fieldRows, children: props.children });
};

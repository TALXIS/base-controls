import { ReactNode, useMemo } from "react";
import { IRecordCardHeaderEndComponents, RecordCardHeaderEndComponents } from "./components";
import { getRecordCardHeaderEndStyles } from "./styles";

export interface IRecordCardHeaderEndProps {
    children?: ReactNode;
    components?: Partial<IRecordCardHeaderEndComponents>;
}

/** The header's end, kept at its own size at the top; it holds tags such as the status. */
export const RecordCardHeaderEnd = (props: IRecordCardHeaderEndProps) => {
    const components = { ...RecordCardHeaderEndComponents, ...props.components };
    const styles = useMemo(() => getRecordCardHeaderEndStyles(), []);
    return components.onRender({ className: styles.container, children: props.children });
};

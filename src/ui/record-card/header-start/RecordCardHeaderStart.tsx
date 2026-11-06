import { ReactNode, useMemo } from "react";
import { IRecordCardHeaderStartComponents, RecordCardHeaderStartComponents } from "./components";
import { getRecordCardHeaderStartStyles } from "./styles";

export interface IRecordCardHeaderStartProps {
    children?: ReactNode;
    components?: Partial<IRecordCardHeaderStartComponents>;
}

/** The header's start, taking the width the end leaves; it holds the title. */
export const RecordCardHeaderStart = (props: IRecordCardHeaderStartProps) => {
    const components = { ...RecordCardHeaderStartComponents, ...props.components };
    const styles = useMemo(() => getRecordCardHeaderStartStyles(), []);
    return components.onRenderContainer({ className: styles.container, children: props.children });
};

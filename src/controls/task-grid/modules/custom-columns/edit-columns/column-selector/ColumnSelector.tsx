import { useState } from "react";
import { useEventEmitter } from "@hooks";
import { useTaskGridRuntime } from "@controls/task-grid/context";
import { ICustomColumnsDataProviderEvents } from "../../CustomColumnsDataProvider";

export interface IColumnSelectorProps {
    children: React.ReactNode;
}

/** The column picker, mounted anew whenever a custom column changes. */
export const ColumnSelector = (props: IColumnSelectorProps) => {
    const customColumns = useTaskGridRuntime().services.get('customColumnsModule');
    const [version, setVersion] = useState(0);

    useEventEmitter<ICustomColumnsDataProviderEvents>(customColumns.provider.events, 'onColumnsChanged', () => setVersion(version => version + 1));

    return <div key={version}>{props.children}</div>;
};

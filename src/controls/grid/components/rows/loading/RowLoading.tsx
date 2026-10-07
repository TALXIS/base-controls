import { ILoadingCellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { useGridService } from "../../../useGridService";
import { useGridComponents } from "../../../context";
import { RowUi } from "../ui";

export interface IRowLoadingProps extends ILoadingCellRendererParams<IRecord> { }

/** What a row shows while its records load, or the error they failed with. */
export const RowLoading = (props: IRowLoadingProps) => {
    const provider = useGridService('provider');
    const components = useGridComponents();
    const parentRecord: IRecord | undefined = props.node.parent?.data;

    if (!props.node.failedLoad) {
        return <RowUi.Loading components={components.rows?.loading} />;
    }
    const failedProvider = parentRecord ? parentRecord.getDataProvider().getGroupedRecordDataProvider(parentRecord.getRecordId())! : provider;
    return <RowUi.Error message={failedProvider.getErrorMessage()} components={components.rows?.error} />;
};

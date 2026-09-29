import { ILoadingCellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { useGridService } from "@controls/grid/useGridService";
import { useGridComponents } from "@controls/grid/context";

/** What a row shows while its records load, or the error they failed with. */
export const RowLoading = (props: ILoadingCellRendererParams<IRecord>) => {
    const provider = useGridService('provider');
    const components = useGridComponents();
    const parentRecord: IRecord | undefined = props.node.parent?.data;

    if (!props.node.failedLoad) {
        return components.onRenderRowLoading({});
    }
    const failedProvider = parentRecord ? parentRecord.getDataProvider().getGroupedRecordDataProvider(parentRecord.getRecordId())! : provider;
    return components.onRenderRowError({ message: failedProvider.getErrorMessage() });
};

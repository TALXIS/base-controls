import { Shimmer } from "@ui"
import { useMemo } from "react"
import { getFullRowLoadingStyles } from "./styles"
import { ILoadingCellRendererParams } from "@ag-grid-community/core"
import { IRecord } from "@talxis/client-libraries"
import { FullWidthCellRendererError } from "@controls/grid/components/errors/full-width-cell-renderer-error/FullWidthCellRendererError"
import { useGridService } from "@controls/grid/useGridService";

export const FullRowLoading = (props: ILoadingCellRendererParams) => {
    const styles = useMemo(() => getFullRowLoadingStyles(), []);
    const provider = useGridService('provider');
    const {node} = props;

    const getDataProvider = () => {
        const parentRecord: IRecord | undefined = node.parent?.data;
        if(parentRecord) {
            return parentRecord.getDataProvider().getGroupedRecordDataProvider(parentRecord.getRecordId())!
        }
        else {
            return provider;
        }
    }
    if (!node.failedLoad) {
        return <Shimmer styles={{
            root: styles.fullRowLoadingRoot,
            shimmerWrapper: styles.shimmerWrapper,
        }} />
    }
    else {
        return <FullWidthCellRendererError 
            errorMessage={getDataProvider().getErrorMessage()} />
    }
}
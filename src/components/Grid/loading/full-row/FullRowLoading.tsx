import { Shimmer } from "@fluentui/react"
import { useMemo } from "react"
import { getFullRowLoadingStyles } from "./styles"
import { ILoadingCellRendererParams } from "@ag-grid-community/core"
import { useGridInstance } from "../../grid/useGridInstance"
import { IRecord } from "@talxis/client-libraries"
import { FullWidthCellRendererError } from "../../errors/FullWidthCellRendererError/FullWidthCellRendererError"

export const FullRowLoading = (props: ILoadingCellRendererParams) => {
    const styles = useMemo(() => getFullRowLoadingStyles(), []);
    const grid = useGridInstance();
    const {node} = props;

    const getDataProvider = () => {
        const parentRecord: IRecord | undefined = node.parent?.data;
        if(parentRecord) {
            return parentRecord.getDataProvider().getGroupedRecordDataProvider(parentRecord.getRecordId())!
        }
        else {
            return grid.getDataset().getDataProvider();
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
import { MessageBar, MessageBarType, Shimmer } from "@fluentui/react"
import { useMemo } from "react"
import { getFullRowLoadingStyles } from "./styles"
import { ILoadingCellRendererParams } from "@ag-grid-community/core"
import { useGridInstance } from "../../grid/useGridInstance"
import { IRecord } from "@talxis/client-libraries"

export const FullRowLoading = (props: ILoadingCellRendererParams) => {
    const styles = useMemo(() => getFullRowLoadingStyles(), []);
    const grid = useGridInstance();
    const {node} = props;

    const getDataProvider = () => {
        const parentRecord: IRecord | undefined = node.parent?.data;
        if(parentRecord) {
            return parentRecord.getDataProvider().getChildDataProvider({
                parentRecordId: parentRecord.getRecordId()
            })
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
        return <MessageBar
            styles={{
                root: styles.errorRoot,
            }}
            messageBarType={MessageBarType.error}>
            {getDataProvider().getErrorMessage()}
        </MessageBar>
    }
}
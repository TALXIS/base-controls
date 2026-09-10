import { MessageBar, MessageBarType } from "@fluentui/react";
import { useMemo } from "react";
import { getFullWidthCellRendererErrorStyles } from "./styles";

interface IFullWidthCellRendererErrorProps {
    errorMessage: string;
}

export const FullWidthCellRendererError = (props: IFullWidthCellRendererErrorProps) => {
    const { errorMessage } = props;
    const styles = useMemo(() => getFullWidthCellRendererErrorStyles(), []);
    return <MessageBar
        styles={{
            root: styles.errorMessageBarRoot
        }}
        messageBarType={MessageBarType.error}>
        {errorMessage}
    </MessageBar>
}
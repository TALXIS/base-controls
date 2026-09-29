import { useMemo } from "react";
import { MessageBarType } from "@fluentui/react";
import { IRowUiErrorComponents, RowUiErrorComponents } from "./components";
import { getRowUiErrorStyles } from "./styles";

export interface IRowUiErrorProps {
    /** What went wrong. */
    message: string;
    components?: Partial<IRowUiErrorComponents>;
}

/** An error the width of the row. */
export const RowUiError = (props: IRowUiErrorProps) => {
    const components = { ...RowUiErrorComponents, ...props.components };
    const styles = useMemo(() => getRowUiErrorStyles(), []);

    return components.onRenderMessageBar({
        messageBarType: MessageBarType.error,
        styles: { root: styles.messageBarRoot },
        children: props.message,
    });
};

import { TooltipHost } from "@fluentui/react";
import { components } from "react-select";
import { getSelectorStyles } from "../../styles";
import { useMemo } from "react";
import { useEditColumnsComponents } from "../../../context";
import { DatasetConstants } from "@talxis/client-libraries";

export const Option = (props: any) => {
    const styles = useMemo(() => getSelectorStyles(), []);
    const editColumnsComponents = useEditColumnsComponents();

    const getTooltipContent = (columnName: string): string => {
        return columnName.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX) ? 'user_column' : columnName;
    }

    return (
        <components.Option {...props}>
            <TooltipHost
                content={getTooltipContent(props.data.name)}
            >
                <div className={styles.optionContainer}>
                    <editColumnsComponents.OptionText {...props as any} />
                    <editColumnsComponents.OptionCommandBar items={[]}/>
                </div>
            </TooltipHost>
        </components.Option>
    );
}
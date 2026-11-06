import { useTheme } from "@theme";
import { useMemo } from "react";

import { FixedSizeList } from "react-window";
import { ITemplatesUiRecordListComponents, TemplatesUiRecordListComponents } from "./components";
import { getTemplatesUiRecordListStyles } from "./styles";
import { RECORD_LIST_HEIGHT, RECORD_LIST_ITEM_HEIGHT, RECORD_SELECTOR_WIDTH } from "../constants";

export interface IRecordListItem {
    id: string;
    name?: string;
}

export interface ITemplatesUiRecordListProps {
    records: IRecordListItem[];
    onRecordSelected: (recordId: string) => void;
    components?: Partial<ITemplatesUiRecordListComponents>;
}

/** A virtualized list of records, each a button that picks it. */
export const TemplatesUiRecordList = (props: ITemplatesUiRecordListProps) => {
    const { records } = props;
    const components = { ...TemplatesUiRecordListComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTemplatesUiRecordListStyles(theme), [theme]);

    return <FixedSizeList className={styles.root} itemCount={records.length} itemSize={RECORD_LIST_ITEM_HEIGHT} height={RECORD_LIST_HEIGHT} width={RECORD_SELECTOR_WIDTH}>
        {({ index, style }) => {
            const record = records[index];
            return <div key={record.id} style={style}>
                {components.onRenderRecord({ className: styles.record, text: record.name, onClick: () => props.onRecordSelected(record.id) })}
            </div>;
        }}
    </FixedSizeList>;
};

import * as React from "react";
import { Cell, ICellProps } from '../../../../Grid/cells/cell/Cell'
import { IRecord } from "@talxis/client-libraries";
import { getTheme, IconButton } from "@fluentui/react";
import { useRerender } from '@talxis/react-components';
import { getGroupCellStyles } from "./styles";
import { useRef } from "react";
import { useTaskDataProvider } from "../../../context";

interface IProps extends ICellProps {
    data: IRecord;
}

export const GroupCell = (props: IProps) => {
    const provider = useTaskDataProvider();
    const record = props.data;
    const node = props.node;
    const expanded = node.expanded;
    const hasChildren = provider.getRecordTree().hasChildren(record.getRecordId());
    const rerender = useRerender()
    const styles = React.useMemo(() => getGroupCellStyles(getTheme(), expanded), [expanded]);
    const buttonRef = useRef<HTMLElement>(null);

    React.useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender)
    }, []);

    const toggleExpand = React.useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        node.setExpanded(!node.expanded)
    }, []);

    React.useEffect(() => {
        buttonRef.current?.addEventListener('click', toggleExpand);
        return () => buttonRef.current?.removeEventListener('click', toggleExpand);
    }, [hasChildren]);

    const getGroupOffset = () => {
        if (provider.isFlatListEnabled()) {
            return 0;
        }
        else {
            const offset = 32;
            const hasChildren = provider.getRecordTree().hasChildren(record?.getRecordId());
            switch (true) {
                case node.level === 0 && provider.getRecordTree().isFlat(): {
                    return 0;
                }
                case !hasChildren: {
                    return node.level * offset + offset;
                }
                default: {
                    return node.level * offset
                }
            }
        }
    }

    const shouldShowChevron = (): boolean => {
        switch (true) {
            case provider.isFlatListEnabled():
            case !hasChildren: {
                return false;
            }
            default: {
                return true;
            }
        }
    }

    return <div style={{ paddingLeft: getGroupOffset() }} className={styles.root}>
        {shouldShowChevron() &&
            <IconButton
                elementRef={buttonRef}
                iconProps={{
                    iconName: 'ChevronRight'
                }}
                className={styles.chevronButton}
            />
        }
        <Cell {...props}  />
    </div>
}
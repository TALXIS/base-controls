import { useMemo, useState } from "react";
import { Check, useTheme } from "@fluentui/react";
import { getClassNames, useLabels } from "@utils";
import { CHECK_LIST_LABELS } from "../../labels";
import { useGridCell } from "../../../grid/components/cells/root/context";
import { useGridField } from "../../../grid/components/cells/field/context";
import { useGridModule } from "../../../grid/useGridModule";
import { CHECK_HOST_CLASS_NAME, getCompletionCheckboxStyles } from "./styles";

/** The round check an item is ticked off with, as Fluent draws a selection check. */
export const CompletionCheckbox = () => {
    const cell = useGridCell();
    const field = useGridField();
    const checkList = useGridModule('checkList');
    const theme = useTheme();
    const labels = useLabels(CHECK_LIST_LABELS);
    const styles = useMemo(() => getCompletionCheckboxStyles(theme), [theme]);
    //only a tick the user just made pops, not one a redrawn row already had
    const [isPopping, setIsPopping] = useState(false);
    const record = cell.getRecord();

    if (!field || !checkList.isItem(record)) {
        return null;
    }
    const label = labels.get('checkList.markItemFinished');
    const isCompleted = checkList.isCompleted(record);

    const onClick = () => {
        setIsPopping(!isCompleted);
        field.setValue(!isCompleted);
    };

    return <button
        type="button"
        role="checkbox"
        aria-checked={isCompleted}
        aria-label={label}
        title={label}
        disabled={cell.isLocked()}
        className={getClassNames([styles.root, CHECK_HOST_CLASS_NAME])}
        onClick={onClick}>
        <Check checked={isCompleted} className={isCompleted && isPopping ? styles.popped : undefined} />
    </button>;
};

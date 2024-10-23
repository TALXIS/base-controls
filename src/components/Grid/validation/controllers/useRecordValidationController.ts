import { useEffect, useMemo, useState } from "react";
import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { ColumnValidation } from "../model/ColumnValidation";
import { IRecord } from "@talxis/client-libraries";

interface IRecordValidation {
    column: IGridColumn;
    record: IRecord;
}

export const useColumnValidationController = (props: IRecordValidation): [boolean, string] => {
    const grid = useGridInstance();
    const column = props.column;
    const record = props.record;
    const columnValidation = useMemo(() => {return new ColumnValidation(grid, column)}, []);

    const [isValid, setIsValid] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if(!column.isEditable) {
            //we are not doing validation for non-editable columns
            return;
        }
        const [isValid, errorMessage] = columnValidation.validate(record.getValue(column.name));
        setIsValid(isValid);
        setErrorMessage(errorMessage);
    }, [record.getValue(column.name)]);

    return [isValid, errorMessage];
}
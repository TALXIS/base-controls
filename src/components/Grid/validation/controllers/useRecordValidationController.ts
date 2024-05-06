import { useEffect, useMemo, useState } from "react";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { ColumnValidation } from "../model/ColumnValidation";

interface IRecordValidation {
    column: IGridColumn;
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
    doNotCheckNull?: boolean;
}

export const useColumnValidationController = (props: IRecordValidation): [boolean, string] => {
    const column = props.column;
    const record = props.record;
    const columnValidation = useMemo(() => {return new ColumnValidation(column.dataType!, props.doNotCheckNull)}, []);

    const [isValid, setIsValid] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("Ivalid input!");

    useEffect(() => {
        const [isValid, errorMessage] = columnValidation.validate(record.getValue(column.key));
        setIsValid(isValid);
        setErrorMessage(errorMessage);
    }, [record.getValue(column.key)]);

    return [isValid, errorMessage];
}
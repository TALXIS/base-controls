import { IRecord } from "@talxis/client-libraries";
import type { IGridServiceLocator } from "../../services";
import { GridField, IGridField } from "./GridField";

export interface IGridFieldsParameters {
    services: IGridServiceLocator;
}

/** Hands out the fields of the grid's records. */
export interface IGridFields {
    /** The same instance for as long as the record lives. */
    get(record: IRecord, columnName: string): IGridField;
}

export class GridFields implements IGridFields {
    private _services: IGridServiceLocator;
    private _fields = new WeakMap<IRecord, Map<string, IGridField>>();

    constructor(parameters: IGridFieldsParameters) {
        this._services = parameters.services;
    }

    public get(record: IRecord, columnName: string): IGridField {
        let fields = this._fields.get(record);
        if (!fields) {
            fields = new Map();
            this._fields.set(record, fields);
        }
        let field = fields.get(columnName);
        if (!field) {
            field = new GridField({ record: record, columnName: columnName, services: this._services });
            fields.set(columnName, field);
        }
        return field;
    }
}

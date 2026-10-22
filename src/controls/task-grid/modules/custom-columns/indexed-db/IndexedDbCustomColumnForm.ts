import { DataType, EventEmitter } from "@talxis/client-libraries";
import type { ILocalizationService } from "@utils";
import type { IIndexedDbCustomColumnFormLabels } from "./labels";

/** What the form asks for a custom column. */
export interface ICustomColumnDefinition {
    displayName: string;
    dataType: DataType;
    isRequired?: boolean;
    /** Decimal places, for a decimal or currency column. */
    precision?: number;
    /** The labels of a choice column's options, in order. */
    options?: string[];
}

export interface IIndexedDbCustomColumnFormEvents {
    onChanged: () => void;
}

/** The column the IndexedDB form shows, and the open waiting for it to close. */
export class IndexedDbCustomColumnForm {
    public readonly events = new EventEmitter<IIndexedDbCustomColumnFormEvents>();
    private _labels: ILocalizationService<IIndexedDbCustomColumnFormLabels>;
    private _definition?: ICustomColumnDefinition;
    private _isNew = false;
    private _resolve?: (definition: ICustomColumnDefinition | null) => void;

    constructor(labels: ILocalizationService<IIndexedDbCustomColumnFormLabels>) {
        this._labels = labels;
    }

    /** Shows the column, a new one when none is given; resolves with what was saved, or `null` when dismissed. */
    public open(definition?: ICustomColumnDefinition): Promise<ICustomColumnDefinition | null> {
        this._isNew = !definition;
        this._definition = definition ?? { displayName: '', dataType: 'SingleLine.Text' };
        this.events.dispatchEvent('onChanged');
        return new Promise(resolve => this._resolve = resolve);
    }

    /** What the form opened with; `undefined` while closed. */
    public getDefinition(): ICustomColumnDefinition | undefined {
        return this._definition;
    }

    public isNew(): boolean {
        return this._isNew;
    }

    public getLabels(): ILocalizationService<IIndexedDbCustomColumnFormLabels> {
        return this._labels;
    }

    public save(definition: ICustomColumnDefinition): void {
        this._close(definition);
    }

    public dismiss(): void {
        this._close(null);
    }

    private _close(result: ICustomColumnDefinition | null): void {
        const resolve = this._resolve;
        this._definition = undefined;
        this._resolve = undefined;
        this.events.dispatchEvent('onChanged');
        resolve?.(result);
    }
}

declare module "../../../runtime/interfaces" {
    interface ITaskDatasetControlRuntimeModuleServiceMap {
        /** The IndexedDB custom columns' form. */
        customColumnForm: IndexedDbCustomColumnForm;
    }
}

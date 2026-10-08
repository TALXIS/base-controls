/** Everything the grid keeps for its next mount, keyed by the part that wrote it. */
export type IGridState = { [key: string]: unknown };

/** A keyed store each part of the grid reads its own entry from and writes it back to. */
export interface IGridStateStorage {
    get<TValue>(key: string): TValue | undefined;
    set<TValue>(key: string, value: TValue): void;
    /** Every entry, to keep for the next mount. */
    getAll(): IGridState;
}

export interface IGridStateStorageParameters {
    /** Written in place. */
    state?: IGridState;
}

export class GridStateStorage implements IGridStateStorage {
    private _state: IGridState;

    constructor(parameters: IGridStateStorageParameters) {
        this._state = parameters.state ?? {};
    }

    public get<TValue>(key: string): TValue | undefined {
        return this._state[key] as TValue | undefined;
    }

    public set<TValue>(key: string, value: TValue): void {
        this._state[key] = value;
    }

    public getAll(): IGridState {
        return this._state;
    }
}

/** What the store keeps, by id; plain data, so a host can persist it. */
export type IStateDictionary = { [id: string]: unknown };

/** Keeps state by id, for whatever needs it back after a remount. */
export interface IStateStore {
    get<TValue>(id: string): TValue | undefined;
    set<TValue>(id: string, value: TValue): void;
    delete(id: string): void;
    /** A store over the entry under `id`, created on first use. */
    scope(id: string): IStateStore;
}

export interface IStateStoreParameters {
    /** Written in place. */
    state?: IStateDictionary;
}

export class StateStore implements IStateStore {
    private _state: IStateDictionary;

    constructor(parameters: IStateStoreParameters = {}) {
        this._state = parameters.state ?? {};
    }

    public get<TValue>(id: string): TValue | undefined {
        return this._state[id] as TValue | undefined;
    }

    public set<TValue>(id: string, value: TValue): void {
        this._state[id] = value;
    }

    public delete(id: string): void {
        delete this._state[id];
    }

    public scope(id: string): IStateStore {
        const entry = this.get<IStateDictionary>(id) ?? {};
        this.set(id, entry);
        return new StateStore({ state: entry });
    }
}

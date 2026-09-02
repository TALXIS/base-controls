import { HookRegistry } from "@utils";
import { ISavedQuery, ISavedQueryMetadata } from "../saved-query";
import { IModuleState, IModuleStateScope, createModuleState, setModuleSlice } from "./moduleState";

/**
 * Asked for a module's own slice whenever a view's state is captured — a remount, or a save into a
 * personal view.
 *
 * Mutates the metadata rather than returning one: it is being built by its owner, and a hook only adds to
 * it. Registered for you by {@link ITaskGridStateProvider.module}.
 */
export type TaskGridStateCaptureHook = (metadata: Partial<ISavedQueryMetadata>) => void;

/**
 * Everything that travels in the control's state dictionary, and who writes each slice.
 *
 * The dictionary is host-shaped — `ComponentFramework.Dictionary`, the same thing a PCF control is handed —
 * and it is passed by reference through the control, the grid component and the chart, so more than one
 * layer writes it. Reach the slices this grid owns through {@link ITaskGridStateProvider} rather than
 * through the object.
 *
 * **How long it lives.** On the React path the `TaskGrid` component holds it in a ref and never hands it
 * back to the host, so it outlives a remount — a view switch, applying *Edit columns*, closing the view
 * manager — and nothing more. A page load starts from `{}`. A `state` prop on `ITaskGridProps` is what
 * would change that.
 */
export interface ITaskGridState {
    /** The view to open on. Ours, through {@link ITaskGridStateProvider}. */
    savedQuery?: Partial<ISavedQuery> & { id: string; linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[] };
    /** The grid layer's slice: what ag-grid restores as its `initialState`. `AgGridModel` owns its shape. */
    AgGridState?: unknown;
    /** The generic dataset control's slice. Written on the PCF entry path, never here. */
    DatasetControlState?: unknown;
    /** What modules keep for the session rather than for the view. See {@link ITaskGridStateProvider.module}. */
    moduleState?: { [moduleKey: string]: unknown };
}

/** The state the grid carries across a remount, and the only thing that writes the slices it owns. */
export interface ITaskGridStateProvider {
    /** The view the control opened on, or the one it is switching to. */
    getView: () => ITaskGridState['savedQuery'];
    /** The view to open on. Read by the factory as the saved-query provider's preferred query. */
    setView: (view: ITaskGridState['savedQuery']) => void;
    /** Forgets the grid layer's slice, for a view whose columns it would not fit. */
    clearGridState: () => void;
    /**
     * One module's slice, in the scope it asks for. Call it once and keep what it returns — the slice is
     * read on first use and then held.
     */
    module: <TState extends object>(key: string, scope: IModuleStateScope) => IModuleState<TState>;
    /**
     * Registers a hook that adds to a view's metadata as it is captured. `module` registers one per
     * `view`-scoped slice, which is what persists it.
     *
     * @param priority Ascending — a lower number runs earlier. Defaults to `0`.
     */
    registerCaptureHook: (hook: TaskGridStateCaptureHook, priority?: number) => void;
    /**
     * Runs every capture hook over the metadata. Called where a view's state is captured — the control on
     * teardown, and the user-queries module when it saves a personal view.
     */
    applyCaptureHooks: (metadata: Partial<ISavedQueryMetadata>) => void;
}

export interface ITaskGridStateParameters {
    /** The dictionary the control was handed. Written in place: other layers hold the same object. */
    state: ITaskGridState;
}

/** Holds {@link ITaskGridStateProvider}. Built by the factory, before the control it belongs to. */
export class TaskGridState implements ITaskGridStateProvider {
    private _state: ITaskGridState;
    private _captureHooks = new HookRegistry<TaskGridStateCaptureHook>();

    constructor(parameters: ITaskGridStateParameters) {
        this._state = parameters.state;
    }

    public getView(): ITaskGridState['savedQuery'] {
        return this._state.savedQuery;
    }

    public setView(view: ITaskGridState['savedQuery']): void {
        this._state.savedQuery = view;
    }

    public clearGridState(): void {
        delete this._state.AgGridState;
    }

    public module<TState extends object>(key: string, scope: IModuleStateScope): IModuleState<TState> {
        const moduleState = createModuleState<TState>({ state: this._state, key, scope });
        if (scope === 'view') {
            this.registerCaptureHook(metadata => setModuleSlice(metadata, key, moduleState.get()));
        }
        return moduleState;
    }

    public registerCaptureHook(hook: TaskGridStateCaptureHook, priority?: number): void {
        this._captureHooks.register(hook, priority);
    }

    public applyCaptureHooks(metadata: Partial<ISavedQueryMetadata>): void {
        this._captureHooks.apply(metadata);
    }
}

import { ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { getSelectionColumnDefinition } from "./getSelectionColumnDefinition";
import { GridSelection } from "./GridSelection";
import { IGridSelectionServiceMap } from "./services";
import { GridSelectionComponents, IGridSelectionComponents } from "./moduleComponents";

export interface ISelectionModuleOptions {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Overrides for the checkbox in a row, or the one in the header. */
    components?: Partial<IGridSelectionComponents>;
}

/**
 * Builds the module that lets rows be selected.
 *
 * There is no `'none'`: a grid that should not offer selection is one that was never given this module,
 * and it then has no checkbox column and nothing to select.
 *
 * @example
 * ```tsx
 * <Grid modules={{ rowModel: createClientSideRowModelModule(), selection: createSelectionModule({ mode: 'multiple' }) }} />
 * ```
 */
export const createSelectionModule = (options: ISelectionModuleOptions): IGridModule => ({
    getInitialComponentProps: () => ({ rowSelection: options.mode }),
    onRegister: gridServices => {
        //the module's own locator: what it registers here is what everything inside it reaches, with the
        //grid's own locator as the one key that crosses over
        const services = new ServiceLocator<IGridSelectionServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup, and AG Grid rebuilds a cell whose
        //renderer identity changed
        const components = { ...GridSelectionComponents, ...options.components };
        services.register('components', () => components);
        const selection = new GridSelection({ services, mode: options.mode });
        gridServices.register('selection', () => selection);
        //read off the module rather than merged again here: one merge means the renderer AG Grid is given
        //keeps one identity, and a changed one rebuilds every cell
        //
        //Ahead of the default hooks, because it is the first column and what follows should order against it
        gridServices.get('columns').registerColumnDefinitionsHook(
            columnDefs => columnDefs.unshift(getSelectionColumnDefinition(selection.components)), -1);
    },
    onDestroy: gridServices => gridServices.get('selection').destroy(),
});

import { IControlParameters, ICustomColumnControl, IField, IRecord } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { getTextColorForBackground, ThemeGenerator } from "@theme";
import type { GridCellLoadingHook, GridCellThemeHook, GridControlHook, GridControlParametersHook } from "../cells";
import type { GridLockHook } from "../locks";
import type { IGridServiceLocator } from "../../services";

/** Ahead of every module. */
const COMPATIBILITY_HOOK_PRIORITY = 0;

export interface IGridLegacyClientApiCompatibilityParameters {
    services: IGridServiceLocator;
}

/** What the legacy client API sets on a record's field, handed to the cells hooks. */
export class GridLegacyClientApiCompatibility {
    private _services: IGridServiceLocator;

    constructor(parameters: IGridLegacyClientApiCompatibilityParameters) {
        this._services = parameters.services;
        const cells = parameters.services.get('cells');
        parameters.services.get('locks').registerLockHook(this._onLock, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerCellLoadingHook(this._onCellLoading, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerCellThemeHook(this._onCellTheme, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerControlHook(this._onControl, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerControlParametersHook(this._onControlParameters, COMPATIBILITY_HOOK_PRIORITY);
        //a legacy script redraws through the dataset
        parameters.services.whenAvailable('gridApi', () => this._provider.addEventListener('onRenderRequested', this._onRenderRequested));
        parameters.services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private _onRenderRequested = (): void => {
        this._services.get('cells').render();
        this._services.get('columns').headers.render();
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onRenderRequested', this._onRenderRequested);
    };

    private get _provider() {
        return this._services.get('provider');
    }

    private _onLock: GridLockHook = (result, { record, columnName }) => {
        const field = record && columnName ? this._getField({ record, columnName }) : undefined;
        if (!field) {
            return;
        }
        //the record already answers for `disabledExpression`, inactive records and group rows
        result.isLocked = field.isDisabled();
    };

    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        const field = this._getField(params);
        if (!field) {
            return;
        }
        result.isLoading = field.ui.isLoading();
    };

    private _onCellTheme: GridCellThemeHook = (theme, params) => {
        const field = this._getField(params);
        if (!field) {
            return;
        }
        const colors = { ...theme.colors };
        //the colours the cell came in with
        const formatting = field.ui.getCustomFormatting(ThemeGenerator.generate(colors)) ?? {};
        const background = formatting.backgroundColor || colors.background;
        const isRecoloured = background !== colors.background;
        //a background of its own is taken as emphasis
        const contrast = getTextColorForBackground(background);
        theme.colors.primary = formatting.primaryColor || (isRecoloured ? contrast : colors.primary);
        theme.colors.background = background;
        theme.colors.text = formatting.textColor || (isRecoloured ? contrast : colors.text);
    };

    private _onControl: GridControlHook = (result, params) => {
        const field = this._getField(params);
        if (!field) {
            return;
        }
        const appliesTo = params.takesInput ? 'editor' : 'renderer';
        //a column may name one control for drawing and another for input
        const customControl = field.ui.getCustomControls([result.control])
            .find(candidate => candidate.appliesTo === 'both' || candidate.appliesTo === appliesTo);
        if (!customControl) {
            return;
        }
        result.control = merge(result.control, customControl) as Required<ICustomColumnControl>;
    };

    private _onControlParameters: GridControlParametersHook = (result, params) => {
        const field = this._getField(params);
        if (!field) {
            return;
        }
        Object.assign(result, field.ui.getControlParameters({ ...result } as IControlParameters));
    };

    /** Only for a column the record's provider has. */
    private _getField(params: { record: IRecord; columnName: string }): IField | undefined {
        if (!params.record.getDataProvider().getColumnsMap()[params.columnName]) {
            return undefined;
        }
        return params.record.getField(params.columnName);
    }
}

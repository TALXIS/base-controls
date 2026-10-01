import { createElement } from "react";
import { EventEmitter, IAddControlNotificationOptions, IControlParameters, ICustomColumnControl, IEventEmitter, IField, IRecord } from "@talxis/client-libraries";
import { ICommandBarItemProps, Target } from "@fluentui/react";
import { CELL_COMMANDS_CLASS_NAME } from "../../components/cells/ui/commands/styles";
import { merge } from "merge-anything";
import { getTextColorForBackground, ThemeGenerator } from "@theme";
import type { GridCellCommandsHook, GridCellLoadingHook, GridCellThemeHook, GridControlHook, GridControlParametersHook } from "../../services/cells";
import type { GridLockHook } from "../../services/locks";
import type { IGridSurface } from "../../services/surfaces";
import type { IGridServiceLocator } from "../../services";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { NotificationCalloutHost } from "./components/notification-callout-host";

const COMPATIBILITY_HOOK_PRIORITY = GRID_MODULE_PRIORITY.legacyClientApiCompatibility;

export interface IGridLegacyClientApiCompatibilityEvents {
    onNotificationOpened: (notification: IAddControlNotificationOptions) => void;
    onNotificationClosed: () => void;
}

export interface IGridLegacyClientApiCompatibilityParameters {
    services: IGridServiceLocator;
}

/** The notification a cell has open, for the callout that shows it. */
export interface IGridLegacyClientApiCompatibility {
    readonly events: IEventEmitter<IGridLegacyClientApiCompatibilityEvents>;
    getOpenNotification(): IAddControlNotificationOptions | undefined;
    /** The command the open notification was clicked from. */
    getOpenTarget(): Target | undefined;
    openNotification(notification: IAddControlNotificationOptions, target?: Target): void;
    closeNotification(): void;
}

/** What the legacy client API sets on a record's field, handed to the cells hooks. */
export class GridLegacyClientApiCompatibility implements IGridLegacyClientApiCompatibility {
    private _services: IGridServiceLocator;
    private _openNotification?: IAddControlNotificationOptions;
    private _openTarget?: Target;
    public readonly events: IEventEmitter<IGridLegacyClientApiCompatibilityEvents> = new EventEmitter<IGridLegacyClientApiCompatibilityEvents>();

    constructor(parameters: IGridLegacyClientApiCompatibilityParameters) {
        this._services = parameters.services;
        const cells = parameters.services.get('cells');
        parameters.services.get('surfaces').registerSurfaceHook(this._onSurfaces, COMPATIBILITY_HOOK_PRIORITY);
        parameters.services.get('locks').registerLockHook(this._onLock, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerCellLoadingHook(this._onCellLoading, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerCellThemeHook(this._onCellTheme, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerCellCommandsHook(this._onCellCommands, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerControlHook(this._onControl, COMPATIBILITY_HOOK_PRIORITY);
        cells.registerControlParametersHook(this._onControlParameters, COMPATIBILITY_HOOK_PRIORITY);
        //a legacy script redraws through the dataset
        parameters.services.whenAvailable('gridApi', () => this._provider.addEventListener('onRenderRequested', this._onRenderRequested));
        parameters.services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    public getOpenNotification(): IAddControlNotificationOptions | undefined {
        return this._openNotification;
    }

    public getOpenTarget(): Target | undefined {
        return this._openTarget;
    }

    public openNotification(notification: IAddControlNotificationOptions, target?: Target): void {
        this._openNotification = notification;
        this._openTarget = target;
        this.events.dispatchEvent('onNotificationOpened', notification);
    }

    public closeNotification(): void {
        this._openNotification = undefined;
        this._openTarget = undefined;
        this.events.dispatchEvent('onNotificationClosed');
    }

    private _onSurfaces = (surfaces: IGridSurface[]): void => {
        surfaces.push({ key: 'notificationCallout', onRender: () => createElement(NotificationCalloutHost, { compatibility: this }) });
    };

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

    private _onCellCommands: GridCellCommandsHook = (result, params) => {
        const field = this._getField(params);
        if (!field) {
            return;
        }
        for (const notification of field.ui.getNotifications()) {
            const command = this._toCommand(notification);
            if (notification.buttonProps?.renderedInOverflow) {
                result.overflowItems.push(command);
            }
            else {
                result.items.push(command);
            }
        }
    };

    private _toCommand(notification: IAddControlNotificationOptions): ICommandBarItemProps {
        const { renderedInOverflow, ...buttonProps } = notification.buttonProps ?? {};
        const actions = notification.actions ?? [];
        const hasContent = !!notification.text || !!notification.messages?.length;
        return {
            key: notification.uniqueId,
            text: notification.text,
            iconProps: notification.iconName ? { iconName: notification.iconName, ...buttonProps.iconProps } : undefined,
            ...buttonProps,
            onClick: (event) => {
                buttonProps.onClick?.(event);
                if (actions.length === 1) {
                    actions[0]!.actions.forEach(callback => callback());
                }
                else if (hasContent && event) {
                    this.openNotification(notification, this._getCalloutTarget(event));
                }
            },
        };
    }

    //an overflow menu item is gone once the menu closes
    private _getCalloutTarget(event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>): Target {
        const element = event.currentTarget;
        if (element.closest(`.${CELL_COMMANDS_CLASS_NAME}`) || !('clientX' in event)) {
            return element;
        }
        return event.nativeEvent;
    }

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

import { getIcon, ICommandBarItemProps, IIconProps } from '@fluentui/react';
import { ICommand, IRecord } from '@talxis/client-libraries';
import type { GridCellCommandsHook, GridCellLoadingHook, GridCellRow, IGrid, IGridColDef, IGridModule } from '@controls/grid';
import { getRibbonUiCommandBarStyles } from '@controls/ribbon/ui/styles';

//overridable through the view's `colDefs`
const INLINE_RIBBON_COLUMN_KEY = 'inlineRibbon';

//Dataverse's ribbon icon names that Fluent knows under another name
const FLUENT_ICON_NAMES: Record<string, string> = {
    Activate: 'ActivateOrders',
    DeActivate: 'DeactivateOrders',
    ExportToExcel: 'ExcelDocument',
    ConnectionToOther: 'Assign',
    EmailLink: 'Link',
    Flows: 'Dataflows',
    RunReport: 'CRMReport',
    Report: 'CRMReport',
    Remove: 'Delete',
    WordTemplates: 'WordDocument',
    DocumentTemplates: 'ExcelDocument',
    New: 'Add',
};

const WEB_RESOURCE_PREFIX = '$webresource:';

//the host fills it in with the table's plural name before drawing its own bar
const COLLECTION_NAME_MARKER = '{EntityLogicalNameCollectionMarker}';

export interface IPowerAppsInlineRibbonParameters {
    /** The buttons a highlighted row shows, by `commandButtonId`. */
    commandButtonIds: string[];
    /** The column whose cells show the buttons; a column of their own when left out. */
    columnName?: string;
    /** Asks the host for its commands on the records, as if they were selected. */
    getRecordCommands: (recordIds: string[], commandButtonIds: string[]) => Promise<ICommand[]>;
}

declare module '@controls/grid/interfaces' {
    interface IGridModuleMap {
        /** The host's commands in the rows. */
        powerAppsInlineRibbon: PowerAppsInlineRibbon;
    }
}

/** Builds the module that shows the host's commands in the rows. */
export const createPowerAppsInlineRibbonModule = (parameters: IPowerAppsInlineRibbonParameters): IGridModule<'powerAppsInlineRibbon'> => ({
    name: 'powerAppsInlineRibbon',
    onLoad: grid => new PowerAppsInlineRibbon(grid, parameters),
    onDestroy: ribbon => ribbon.destroy(),
});

interface IRecordCommands {
    /** Unset while the host is asked. */
    commands?: ICommand[];
    isExecuting?: boolean;
}

/** The host's commands as buttons in a row, for its record or a group's selected records. */
export class PowerAppsInlineRibbon {
    private _grid: IGrid;
    private _commandButtonIds: string[];
    private _columnName: string;
    private _getRecordCommands: IPowerAppsInlineRibbonParameters['getRecordCommands'];
    private _recordCommands = new Map<string, IRecordCommands>();
    private _removers: (() => void)[];

    constructor(grid: IGrid, parameters: IPowerAppsInlineRibbonParameters) {
        this._grid = grid;
        this._commandButtonIds = parameters.commandButtonIds;
        this._columnName = parameters.columnName ?? INLINE_RIBBON_COLUMN_KEY;
        this._getRecordCommands = parameters.getRecordCommands;
        const cells = this._grid.services.get('cells');
        const provider = this._grid.services.get('provider');
        this._removers = [
            cells.hooks.commands.add(this._onCellCommands),
            //a group row's commands depend on every record selected in it
            provider.addEventListener('onRecordColumnValueChanged', () => this._forgetAll()),
            provider.addEventListener('onAfterRecordSaved', () => this._forgetAll()),
            provider.addEventListener('onAfterRecordsDeleted', () => this._forgetAll()),
            provider.addEventListener('onRecordsSelected', () => this._forgetAll()),
            provider.addEventListener('onNewDataLoaded', () => this._recordCommands.clear()),
        ];
        if (!parameters.columnName) {
            this._removers.push(
                cells.hooks.loading.add(this._onCellLoading),
                this._grid.services.get('columns').hooks.columnDefinitions.add(this._onColumnDefinitions),
            );
        }
    }

    public destroy(): void {
        this._removers.forEach(remove => remove());
    }

    private _onColumnDefinitions = (columnDefs: IGridColDef[]): void => {
        columnDefs.push(this._grid.services.get('columns').createUnboundColDef({
            colId: INLINE_RIBBON_COLUMN_KEY,
            width: 160,
            pinned: 'right',
            sortable: false,
        }));
    };

    private _onCellLoading: GridCellLoadingHook = (result, { record, columnName }) => {
        const recordCommands = this._recordCommands.get(record.getRecordId());
        if (columnName === this._columnName && recordCommands && !recordCommands.commands) {
            result.isLoading = true;
        }
    };

    //runs only for highlighted rows, so only those are asked for
    private _onCellCommands: GridCellCommandsHook = (result, { record, columnName, row }) => {
        if (columnName !== this._columnName) {
            return;
        }
        const recordIds = this._getCommandRecordIds(record, row);
        if (recordIds.length === 0) {
            return;
        }
        const recordCommands = this._recordCommands.get(record.getRecordId()) ?? this._load(record, recordIds);
        for (const command of recordCommands.commands ?? []) {
            if (command.shouldBeVisible) {
                result.items.push(this._toItem(command, record, recordCommands));
            }
        }
    };

    //a group row acts on the records selected under it, a total row on none
    private _getCommandRecordIds(record: IRecord, row: GridCellRow): string[] {
        switch (row) {
            case 'record':
                return [record.getRecordId()];
            case 'group': {
                const group = record.getDataProvider().getGroupedRecordDataProviders().find(child => child.getParentRecordId() === record.getRecordId());
                return group?.getSelectedRecordIds() ?? [];
            }
            default:
                return [];
        }
    }

    private _load(record: IRecord, recordIds: string[]): IRecordCommands {
        const recordCommands: IRecordCommands = {};
        this._recordCommands.set(record.getRecordId(), recordCommands);
        void this._retrieve(record, recordIds, recordCommands);
        //the hook runs while the cell draws
        queueMicrotask(this._render);
        return recordCommands;
    }

    private async _retrieve(record: IRecord, recordIds: string[], recordCommands: IRecordCommands): Promise<void> {
        try {
            recordCommands.commands = await this._getRecordCommands(recordIds, this._commandButtonIds);
        }
        catch (error) {
            recordCommands.commands = [];
            console.error(error);
        }
        if (this._recordCommands.get(record.getRecordId()) === recordCommands) {
            this._render();
        }
    }

    private _toItem(command: ICommand, record: IRecord, recordCommands: IRecordCommands): ICommandBarItemProps {
        const children: ICommand[] = (command.children ?? []).filter((child: ICommand) => child.shouldBeVisible);
        return {
            key: command.commandButtonId,
            text: this._fillMarkers(command.label),
            title: this._fillMarkers(command.tooltip),
            disabled: !command.canExecute || recordCommands.isExecuting,
            iconProps: getIconProps(command.icon),
            ['data-id']: command.commandButtonId,
            subMenuProps: children.length > 0 ? { items: children.map(child => this._toItem(child, record, recordCommands)) } : undefined,
            onClick: children.length > 0 ? undefined : () => void this._execute(command, record, recordCommands),
        };
    }

    private _fillMarkers(text: string | undefined): string | undefined {
        const collectionName = this._grid.services.get('provider').getMetadata()?.DisplayCollectionName;
        return collectionName ? text?.split(COLLECTION_NAME_MARKER).join(collectionName) : text;
    }

    private async _execute(command: ICommand, record: IRecord, recordCommands: IRecordCommands): Promise<void> {
        recordCommands.isExecuting = true;
        this._render();
        try {
            await command.execute();
        }
        finally {
            this._forget(record.getRecordId());
        }
    }

    private _forget(recordId: string): void {
        if (this._recordCommands.delete(recordId)) {
            this._render();
        }
    }

    private _forgetAll(): void {
        this._recordCommands.clear();
        this._render();
    }

    private _render = (): void => {
        this._grid.services.get('cells').render({ columnNames: [this._columnName] });
    };
}

const getIconProps = (icon?: string): IIconProps | undefined => {
    if (!icon) {
        return undefined;
    }
    if (icon.startsWith(WEB_RESOURCE_PREFIX)) {
        const src = getWebResourceUrl(icon.slice(WEB_RESOURCE_PREFIX.length));
        return src ? getImageIconProps(src) : undefined;
    }
    if (icon.startsWith('https://')) {
        return getImageIconProps(icon);
    }
    const iconName = FLUENT_ICON_NAMES[icon] ?? icon;
    return { iconName: getIcon(iconName) ? iconName : 'Puzzle' };
};

//sized like the ribbon's image icons
const getImageIconProps = (src: string): IIconProps => ({ imageProps: { src }, className: getRibbonUiCommandBarStyles().imageIcon });

//resolved against the document, since an isolated frame has no host of its own
const getWebResourceUrl = (name: string): string | undefined => {
    const path = window.Xrm?.Utility?.getGlobalContext().getWebResourceUrl(name);
    return path ? new URL(path, document.baseURI).href : undefined;
};

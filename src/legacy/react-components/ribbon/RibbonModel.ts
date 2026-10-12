import { Client, EventEmitter, ICommand } from "@talxis/client-libraries";
import { IRibbon } from "./interfaces";


export interface IRibbonModelEvents {
    onBeforeCommandExecuted: () => void;
    onCommandExecutionFinished: () => void
}

export class RibbonModel extends EventEmitter<IRibbonModelEvents> {
    private _getProps: () => IRibbon;
    private _pendingActionsSet: Set<string> = new Set<string>();
    private _client: Client = new Client();
    constructor(getProps: () => IRibbon) {
        super();
        this._getProps = getProps;
    }

    public async executeCommand(command: ICommand) {
        this._pendingActionsSet.add(command.commandId);
        this.dispatchEvent('onBeforeCommandExecuted');
        try {
            await command.execute();
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this._pendingActionsSet.delete(command.commandId);
            this.dispatchEvent('onCommandExecutionFinished');
        }
    }

    public isLoading(): boolean {
        return this._getProps().parameters.Loading?.raw ?? false;
    }

    public isCommandDisabled(command: ICommand): boolean {
        if (this._getProps().context.mode.isControlDisabled) {
            return true;
        }
        if (!command.canExecute) {
            return true;
        }
        if (this._pendingActionsSet.has(command.commandId)) {
            return true;
        }
        return false;
    }

    public getIconUrl(iconName?: string): string | null {
        if (!iconName) {
            return null;
        }
        if (this._client.isTalxisPortal()) {
            if(iconName.startsWith('https://')) {
                return iconName;
            }
            else {
                return null;
            }
        }
        else {
            const webResourceName = iconName.split('$webresource:')[1];
            if (!webResourceName) {
                return null;
            }
            return `https://${window.location.host}${window.Xrm.Utility.getGlobalContext().getWebResourceUrl(webResourceName)}`
        }
    }

    public getIconType(iconName?: string): 'url' | 'fluent' | 'none' {
        if (!iconName) {
            return 'none'
        }
        if (!this._client.isTalxisPortal() && iconName.startsWith('$')) {
            return 'url';
        }
        if (this._client.isTalxisPortal() && iconName.startsWith('https://')) {
            return 'url';
        }
        return 'fluent';
    }
}
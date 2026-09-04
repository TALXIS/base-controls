import { IAddControlNotificationOptions, ICustomColumnComponent, ICustomColumnFormatting } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { ICellValues } from "./cells/interfaces";

export class Comparator {

    public isEqual(oldValues?: ICellValues, newValues?: ICellValues) {
        //AG Grid asks this per cell per value read, and the common answer is "the same object"
        if (oldValues === newValues) {
            return true;
        }
        if (!this._isEqual(oldValues?.value, newValues?.value)) {
            return false;
        }
        if (!this._isEqual(oldValues?.aggregatedValue, newValues?.aggregatedValue)) {
            return false;
        }
        if (!this._isEqual(oldValues?.columnAlignment, newValues?.columnAlignment)) {
            return false;
        }
        if (!this._areNotificationsEqual(oldValues?.notifications ?? [], newValues?.notifications ?? [])) {
            return false;
        }
        if (!this._isEqual(oldValues?.saving, newValues?.saving)) {
            return false;
        }
        if (!this._isEqual(this._parseFormatting(oldValues?.customFormatting), this._parseFormatting(newValues?.customFormatting))) {
            return false;
        }
        if (!this._isEqual(oldValues?.error, newValues?.error)) {
            return false;
        }
        if (!this._isEqual(oldValues?.errorMessage, newValues?.errorMessage)) {
            return false;
        }
        if (!this._isEqual(oldValues?.editable, newValues?.editable)) {
            return false;
        }
        if (!this._isEqual(oldValues?.loading, newValues?.loading)) {
            return false;
        }
        if (!this._isEqual(this._parseCustomComponent(oldValues?.customComponent), this._parseCustomComponent(newValues?.customComponent))) {
            return false;
        }
        return true;

    }

    private _isEqual(previousValue: any, newValue: any): boolean {
        return deepEqual(previousValue ?? {}, newValue ?? {});
    }

    private _areNotificationsEqual(previousNotifications: IAddControlNotificationOptions[], newNotifications: IAddControlNotificationOptions[]): boolean {
        const previousNotificationIds = previousNotifications.map(x => x.uniqueId);
        const newNotificationIds = newNotifications.map(x => x.uniqueId);

        return this._isEqual(previousNotificationIds, newNotificationIds);
    }

    //ignore the components folder when calculating the diff
    private _parseFormatting(formatting?: ICustomColumnFormatting) {
        if (formatting?.themeOverride) {
            return {
                ...formatting,
                themeOverride: {
                    ...formatting.themeOverride,
                    components: {}
                }
            }
        }
        return formatting;
    }

    private _parseCustomComponent(component?: ICustomColumnComponent) {
        return component?.key ?? '';
    }

}
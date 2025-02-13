import { IAddControlNotificationOptions } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { ICellValues } from "./AgGrid";

export class Comparator {

    public isEqual(oldValues?: ICellValues, newValues?: ICellValues) {
        if (!this._isEqual(oldValues?.customFormatting, newValues?.customFormatting)) {
            return false;
        }
        if (!this._isEqual(oldValues?.value, newValues?.value)) {
            return false;
        }
        if (!this._isEqual(oldValues?.height, newValues?.height)) {
            return false;
        }
        if (!this._isEqual(oldValues?.parameters, newValues?.parameters)) {
            return false;
        }
        if (!this._areNotificationsEqual(oldValues?.notifications ?? [], newValues?.notifications ?? [])) {
            return false;
        }
        if (!this._isEqual(oldValues?.customFormatting, newValues?.customFormatting)) {
            return false;
        }
        if (!this._isEqual(oldValues?.customControls, newValues?.customControls)) {
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

}
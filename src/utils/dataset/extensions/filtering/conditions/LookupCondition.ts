import { DataTypes, IOperator, Operators, Sanitizer } from "@talxis/client-libraries";
import { Condition } from "./Condition";
import { IBinding } from "../../../../../components/NestedControlRenderer/interfaces";

export class LookupCondition extends Condition {
    private _lastSelectedLookupValue: ComponentFramework.LookupValue[] | null = null;
    private _lastSelectedStringValue: string | null = null;
    private _isValueLoading: boolean = false;

    constructor(...args: any) {
        ///@ts-ignore
        super(...args)
        //this prefills the lastSelected option
        this._getFilterValue(this._getControlValue(this.getValue()));
    }

    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value: {
                return DataTypes.LookupSimple;
            }
        }

        return DataTypes.SingleLineText;
    }

    public isValueLoading(): boolean {
        return this._isValueLoading;
    }

    public getBindings(): { [key: string]: IBinding } {
        return {
            'MultipleEnabled': {
                isStatic: true,
                type: 'TwoOptions',
                value: true
            }
        }
    }

    protected _getControlValue(value: string | string[]): ComponentFramework.LookupValue[] | string | null {

        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Return array of lookup values
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
                if (this._lastSelectedLookupValue) {
                    return this._lastSelectedLookupValue;
                }
                if (isArray) {
                    const guids = (value as string[]).map(v => this._getGuid(v)).filter(guid => guid !== null) as string[];
                    this._getLookupValue(guids);
                    return null;
                }
                if (isString) {
                    const guid = this._getGuid(value);
                    if (guid) {
                        this._getLookupValue([guid]);
                    }
                    return null;
                }
                return null;

            // Return plain string (non-lookup format)
            case Operators.Like.Value:
            case Operators.NotLike.Value:
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value:
                if (this._lastSelectedStringValue) {
                    return this._lastSelectedStringValue;
                }
                if (isArray || this._getGuid(value)) {
                    return null;
                }
                if (isString) {
                    return value;
                }
                return null;

            default:
                return null;
        }
    }

    protected _getFilterValue(value: ComponentFramework.LookupValue[] | string | null): string | string[] | null {
        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Return array of lookup values
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
                this._lastSelectedLookupValue = value as any;
                if (isArray) {
                    if (value.length === 1) {
                        return value[0].id;
                    }
                    return value.map(v => v.id);
                }
                return null;

            // Return plain string (non-lookup format)
            case Operators.Like.Value:
            case Operators.NotLike.Value:
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value:
                this._lastSelectedStringValue = value as string;
                if (isString) {
                    return value;
                }
                return null;

            default:
                return null;
        }
    }

    protected _getUndecoratedOperator(operator: IOperator["Value"], value: any): IOperator["Value"] {
        if (Array.isArray(value)) {
            switch (operator) {
                case Operators.In.Value: {
                    return Operators.Equal.Value;
                }
                case Operators.NotIn.Value: {
                    return Operators.DoesNotEqual.Value
                }
            }
        }
        return operator;
    }

    protected _getDecoratedOperator(operator: IOperator["Value"], value: any): IOperator["Value"] {
        if (Array.isArray(value)) {
            switch (operator) {
                case Operators.Equal.Value: {
                    return Operators.In.Value;
                }
                case Operators.DoesNotEqual.Value: {
                    return Operators.NotIn.Value
                }
            }
        }
        return operator;
    }

    private _getGuid(value: any): string | null {
        const guidRegex = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32})$/i;
        if (guidRegex.test(value)) {
            return Sanitizer.Guid.removeGuidBrackets(value);
        }
        return null;
    }

    private async _getLookupValue(guids: string[]): Promise<void> {
        if (this._isValueLoading) {
            return;
        }
        this._isValueLoading = true;
        const lookupValues: ComponentFramework.LookupValue[] = [];
        for (const guid of guids) {
            //@ts-ignore
            for (const target of this.getColumn().metadata.Targets) {
                try {
                    const lookupEntityMetadata = await window.Xrm.Utility.getEntityMetadata(target, []);
                    const response = await window.Xrm.WebApi.retrieveRecord(target, guid, `?$select=${lookupEntityMetadata.PrimaryNameAttribute}`);
                    lookupValues.push({
                        entityType: target,
                        id: response[lookupEntityMetadata.PrimaryIdAttribute],
                        name: response[lookupEntityMetadata.PrimaryNameAttribute]
                    })
                    break;
                }
                catch (err) {
                    continue;
                }
            }
        }
        this._isValueLoading = false;
        this._lastSelectedLookupValue = lookupValues;
        this.setValue(lookupValues);
    }

}
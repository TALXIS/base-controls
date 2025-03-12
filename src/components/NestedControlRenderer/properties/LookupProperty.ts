import { FieldValue, PromiseCache } from "@talxis/client-libraries";
import { Property } from "./Property";
import { ILookupProperty } from "../../../interfaces";

const LookupCache = new PromiseCache();

export class LookupProperty extends Property {

    public getParameter(): ILookupProperty {
        const value = this.getValue() ?? [];        
        return {
            raw: value,
            formatted: this.getFormattedValue(),
            getAllViews: (entityName: string, __queryType?: number) => this._getAllViews(entityName, __queryType),
            attributes: <any>this.attributeMetadata ?? {
                Targets: [],
            }
        }
    }

    private async _getAllViews(entityName: string, __queryType: number = 64) {
        const cacheKey = `${entityName}_${__queryType}`
        const result = await LookupCache.get(cacheKey, async () => {
            const response = await this.parentPcfContext.webAPI.retrieveMultipleRecords('savedquery', `?$filter=returnedtypecode eq '${entityName}' and querytype eq ${__queryType} and isdefault eq true&$select=name,savedqueryid,fetchxml`);
            return response.entities[0];
        })
        return [
            {
                isDefault: true,
                viewName: result.name,
                viewId: result.savedqueryid,
                fetchXml: result.fetchxml
            }
        ]
    }
}
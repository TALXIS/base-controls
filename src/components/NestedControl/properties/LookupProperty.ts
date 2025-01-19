import { FieldValue, PromiseCache } from "@talxis/client-libraries";
import { Property } from "./Property";
import { ILookupProperty } from "../../../interfaces";

const LookupCache = new PromiseCache()

export class LookupProperty extends Property {
    public getParameter(): ILookupProperty {
        const value = this.getValue();
        const formattedValue = new FieldValue(value, this.dataType).getFormattedValue();
        
        return {
            raw: value,
            formatted: formattedValue ?? undefined,
            getAllViews: (entityName: string) => this._getAllViews(entityName),
            attributes: <any>this.attributeMetadata ?? {
                Targets: [],
            }
        }
    }

    private async _getAllViews(entityName: string) {
        const cacheKey = `${entityName}`;
        const result = await LookupCache.get(cacheKey, async () => {
            const response = await this.parentPcfContext.webAPI.retrieveMultipleRecords('savedquery', `?$filter=returnedtypecode eq '${entityName}' and querytype eq 64 and isdefault eq true&$select=name,savedqueryid,fetchxml`);
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
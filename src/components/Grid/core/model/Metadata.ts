import { IAttributeMetadata } from "@talxis/client-libraries";
import { GridDependency } from "./GridDependency";

export class Metadata extends GridDependency {

    public get(columnName: string): Partial<IAttributeMetadata> {
        return this._dataset.columns.find(x => x.name === columnName)?.metadata ?? {}
    }
    public async getOptions(columnName: string): Promise<[number | boolean, ComponentFramework.PropertyHelper.OptionMetadata[]]> {
        const columnMetadata = await this.get(columnName);
        return [columnMetadata.DefaultFormValue!, columnMetadata.OptionSet ?? []];
    }
}

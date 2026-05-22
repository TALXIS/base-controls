import { FetchXmlDataProvider, IDataProvider } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";

export interface ILookupManyStrategy {
    fetchXml: string;
    variables?: { [key: string]: any };
}


export class FetchXmlDataProviderFactory {
    private static _liquid: Liquid = new Liquid();

    public static create(strategy: ILookupManyStrategy): IDataProvider {
        const variables = strategy.variables ?? {};
        let fetchXml = this._liquid.parseAndRenderSync(strategy.fetchXml, variables);
        return new FetchXmlDataProvider({
            fetchXml: fetchXml
        });
    }
}
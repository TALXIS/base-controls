import { IColumn, Operators } from "@talxis/client-libraries";

export class LookupManyHelpers {

    public static injectLookupManyFilterOperators(lookupManyColumns: IColumn[]) {
        lookupManyColumns.map(col => {
            const filterOperators = (col.metadata?.SupportedFilterConditionOperators ?? []).filter(operator => operator !== Operators.Equal.Value && operator !== Operators.DoesNotEqual.Value);
            col.metadata = {
                ...col.metadata,
                SupportedFilterConditionOperators: [
                    Operators.Equal.Value,
                    Operators.DoesNotEqual.Value,
                    Operators.ContainValues.Value,
                    Operators.DoesNotContainValues.Value,
                    ...filterOperators,
                ]
            }
        })
    }
}
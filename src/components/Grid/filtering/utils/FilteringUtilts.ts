import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { OPERATORS } from "../constants";


export class FilteringUtils {
    public static condition() {
        return {
            operator: (conditionOperator?: DatasetConditionOperator) => {
                return {
                    textFieldOperators: (() => {
                        return OPERATORS.filter(operator => {
                            switch (operator.type) {
                                case DatasetConditionOperator.Equal:
                                case DatasetConditionOperator.NotEqual:
                                case DatasetConditionOperator.Like:
                                case DatasetConditionOperator.NotLike:
                                case DatasetConditionOperator.BeginWith:
                                case DatasetConditionOperator.DoesNotBeginWith:
                                case DatasetConditionOperator.EndsWith:
                                case DatasetConditionOperator.DoesNotEndWith:
                                case DatasetConditionOperator.NotNull:
                                case DatasetConditionOperator.Null: {
                                    return true;
                                }
                                default: {
                                    return false;
                                }
                            }
                        });
                    })(),
                    numberOperators: (() => {
                        return OPERATORS.filter(operator => {
                            switch (operator.type) {
                                case DatasetConditionOperator.Equal:
                                case DatasetConditionOperator.NotEqual:
                                case DatasetConditionOperator.GreaterThan:
                                case DatasetConditionOperator.GreaterEqual:
                                case DatasetConditionOperator.LessThan:
                                case DatasetConditionOperator.LessEqual:
                                case DatasetConditionOperator.Null:
                                    return true;
                                default:
                                    return false;
                            }
                        });
                    })(),
                    dateOperators: (() => {
                        return OPERATORS.filter(operator => {
                            switch (operator.type) {
                                case DatasetConditionOperator.On:
                                case DatasetConditionOperator.OnOrAfter:
                                case DatasetConditionOperator.OnOrBefore:
                                case DatasetConditionOperator.Today:
                                case DatasetConditionOperator.Yesterday:
                                case DatasetConditionOperator.Tomorrow:
                                case DatasetConditionOperator.ThisWeek:
                                case DatasetConditionOperator.ThisMonth:
                                case DatasetConditionOperator.ThisYear:
                                case DatasetConditionOperator.Next7Days:
                                case DatasetConditionOperator.NextXDays:
                                case DatasetConditionOperator.NextXMonths:
                                case DatasetConditionOperator.LastWeek:
                                case DatasetConditionOperator.Last7Days:
                                case DatasetConditionOperator.LastMonth:
                                case DatasetConditionOperator.LastYear:
                                case DatasetConditionOperator.LastXDays:
                                case DatasetConditionOperator.LastXMonths:
                                case DatasetConditionOperator.Null:
                                    return true;
                                default:
                                    return false;
                            }
                        });
                    })(),
                    multipleOptionSetOperators: (() => {
                        return OPERATORS.filter(operator => {
                            switch (operator.type) {
                                case DatasetConditionOperator.Equal:
                                case DatasetConditionOperator.NotEqual:
                                case DatasetConditionOperator.ContainValues:
                                case DatasetConditionOperator.DoesNotContainValues:
                                case DatasetConditionOperator.Null:
                                case DatasetConditionOperator.NotNull:
                                    return true;
                                default:
                                    return false;
                            }
                        });
                    })(),
                    fileOperators: (() => {
                        return OPERATORS.filter(operator => {
                            switch(operator.type) {
                                case DatasetConditionOperator.Null:
                                case DatasetConditionOperator.NotNull:
                                    return true;
                                default: 
                                    return false;
                            }
                        })
                    })(),
                    allowsOnlyFreeText: (() => {
                        switch (conditionOperator) {
                            case DatasetConditionOperator.BeginWith:
                            case DatasetConditionOperator.DoesNotBeginWith:
                            case DatasetConditionOperator.EndsWith:
                            case DatasetConditionOperator.DoesNotEndWith:
                            case DatasetConditionOperator.Like:
                            case DatasetConditionOperator.NotLike: {
                                return true;
                            }
                        }
                        return false;
                    })(),
                    allowsOnlyNumber: (() => {
                        switch (conditionOperator) {
                            case DatasetConditionOperator.LastXDays:
                            case DatasetConditionOperator.LastXMonths:
                            case DatasetConditionOperator.NextXMonths:
                            case DatasetConditionOperator.NextXDays: {
                                return true;
                            }
                        }
                        return false;
                    })()
                }
            },
            value: (conditionOperator: DatasetConditionOperator) => {
                return {
                    isEditable: (() => {
                        switch (conditionOperator) {
                            case DatasetConditionOperator.Null:
                            case DatasetConditionOperator.NotNull:
                            case DatasetConditionOperator.Today:
                            case DatasetConditionOperator.Yesterday:
                            case DatasetConditionOperator.Tomorrow:
                            case DatasetConditionOperator.ThisMonth:
                            case DatasetConditionOperator.ThisWeek:
                            case DatasetConditionOperator.InFiscalPeriodAndYear:
                            case DatasetConditionOperator.Next7Days:
                            case DatasetConditionOperator.LastWeek:
                            case DatasetConditionOperator.Last7Days:
                            case DatasetConditionOperator.LastMonth:
                            case DatasetConditionOperator.LastYear: {
                                return false;
                            }
                        }
                        return true;
                    })(),
                    isManuallyEditable: (() => {
                        switch (conditionOperator) {
                            case DatasetConditionOperator.Like:
                            case DatasetConditionOperator.NotLike:
                            case DatasetConditionOperator.BeginWith:
                            case DatasetConditionOperator.DoesNotBeginWith:
                            case DatasetConditionOperator.EndsWith:
                            case DatasetConditionOperator.DoesNotEndWith:
                            case DatasetConditionOperator.LastXDays:
                            case DatasetConditionOperator.LastXMonths:
                            case DatasetConditionOperator.NextXMonths:
                            case DatasetConditionOperator.NextXDays:
                            {
                                return true;
                            }
                        }
                        return false;
                    })()
                }
            }
        }
    }
}
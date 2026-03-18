export interface IQuickFindLabels {
    placeholder: string;
    likeWarning: string;
    beginsWith: string;
    applies: string;
    theseColumns: string;
}
export const getLabels = (): IQuickFindLabels => {
    return {
        placeholder: "Search...",
        likeWarning: "For faster results, don't start with an asterisk (*)",
        beginsWith: "begins with",
        applies: "Applies",
        theseColumns: "on these columns"

    }
}
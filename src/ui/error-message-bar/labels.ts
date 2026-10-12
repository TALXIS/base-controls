/** The texts of the error message bar's commands. */
export interface IErrorMessageBarLabels {
    /** The command that opens the PCF error dialog. */
    details: string;
    /** The command that calls `onRetry`. */
    tryAgain: string;
}

/** The English defaults for {@link IErrorMessageBarLabels}. */
export const ERROR_MESSAGE_BAR_LABELS: IErrorMessageBarLabels = {
    details: 'Details',
    tryAgain: 'Try again',
};

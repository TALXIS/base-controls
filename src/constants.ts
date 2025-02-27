export const CURRENCY_POSITIVE_PATTERN: { [key: number]: string } = {
    0: '$n',
    1: 'n$',
    2: '$ n',
    3: 'n $',
};
export const CURRENCY_NEGATIVE_PATTERN: { [key: number]: string } = {
    0: '($n)',
    1: '-$n',
    2: '$-n',
    3: '$n-',
    4: '(n$)',
    5: '-n$',
    6: 'n-$',
    7: 'n$-',
    8: '-n $',
    9: '-$ n',
    10: 'n $-',
    11: '$ n-',
    12: '$ -n',
    13: 'n- $',
    14: '($ n)',
    15: '(n $)',
    16: '$- n'
};
export const NUMBER_NEGATIVE_PATTERN: { [key: number]: string } = {
    0: '(n)',
    1: '-n',
    2: '- n',
    3: 'n-',
    4: 'n -'
};
export const PERCENT_POSITIVE_PATTERN: { [key: number]: string } = {
    0: 'n %',
    1: 'n%',
    2: '%n',
    3: '% n'
};
export const PERCENT_NEGATIVE_PATTERN: { [key: number]: string } = {
    0: '-n %',
    1: '-n%',
    2: '-%n',
    3: '%-n',
    4: '%n-',
    5: 'n-%',
    6: 'n%-',
    7: '-% n',
    8: 'n %-',
    9: '% n-',
    10: '% -n',
    11: 'n- %'
};
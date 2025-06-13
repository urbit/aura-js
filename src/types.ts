export type aura = 'c'
                 | 'da'
                 | 'dr'
                 | 'f'
                 | 'n'
                 | 'p'
                 | 'q'
                 | 'sb'
                 | 'sd'
                 | 'si'
                 | 'sv'
                 | 'sw'
                 | 'sx'
                 | 't'
                 | 'ta'
                 | 'tas'
                 | 'ub'
                 | 'ud'
                 | 'ui'
                 | 'uv'
                 | 'uw'
                 | 'ux';

export type dime = { aura: aura, atom: bigint }

export type coin = ({ type: 'dime' } & dime)
                 | { type: 'blob', jam: bigint }  //NOTE  nockjs for full noun
                 | { type: 'many', list: coin[] }

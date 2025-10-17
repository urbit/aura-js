//  main

export * from './types';
export { parse, tryParse, valid, slav, slaw, nuck } from './parse';
export { render, scot, rend } from './render';  //TODO  expose encodeString() ?

//  atom utils

import { toUnix, fromUnix } from './da';
export const da = { toUnix, fromUnix };

import type * as pt from './p';
import { cite, sein, clan, kind, rankToSize, sizeToRank } from './p';
export const p = { cite, sein, clan, kind, rankToSize, sizeToRank };
export namespace p {
  export type rank = pt.rank;
  export type size = pt.size;
}

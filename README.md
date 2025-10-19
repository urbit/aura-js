# `@urbit/aura`

Hoon literal syntax parsing and rendering. Approaching two nines of parity with hoon stdlib.

Supports all standard auras (except `@dr` and `@uc`).

## API overview

Atoms are native `bigint`s. Top-level library functions reflect the hoon stdlib. Aliases are provided for your comfort. Summary of exports below.

### Parsing

```typescript
const parse = slav;
const tryParse = slaw;
function valid(:aura, :string): boolean;
function slav(:aura, :string): bigint;  //  throws on failure
function slaw(:aura, :string): bigint | null;
function nuck(:string): coin | null;
```

### Rendering

```typescript
const render = scot;
function scot(:aura, :bigint): string;
function rend(:coin): string;
```

### Utilities

We provide some utilities for desirable operations on specific auras. These too generally match their hoon stdlib equivalents.

```typescript
const da = {
  function toUnix(:bigint): number,
  function fromUnix(:number): bigint,
};
const p = {
  type rank = 'czar'   | 'king' | 'duke'   | 'earl' | 'pawn',
  type size = 'galaxy' | 'star' | 'planet' | 'moon' | 'comet',
  function cite(:bigint | string): string,
  function sein(:bigint): bigint,
  function sein(:string): string,  //  throws on bad input
  function clan(:bigint | string): rank,  //  throws on bad input
  function kind(:bigint | string): size,  //  throws on bad input
  function rankToSize(:rank): size,
  function sizeToRank(:size): rank,
};
```

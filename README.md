# `@urbit/aura`

This NPM package is intended to ease the flow of developing FE applications for urbit, by adding parsing and formatting functions for the various urbit auras

## API

```typescript
// @da manipulation
function parseDa(da: string): BigInteger
function formatDa(da: BigInteger): string

// @p manipulation
// Convert a number to a @p-encoded string.
function patp(arg: string | number | BigInteger): string
function hex2patp(hex: string): string
function patp2hex(name: string): string
function patp2bn(name: string): BigInteger
function patp2dec(name: string): string
// Determine the ship class of a @p value.
function clan(who: string): string
// Determine the parent of a @p value.
function sein(name: string): strin
// Validate a @p string.
function isValidPatp(str: string): boolean
// Ensure @p is sigged.
function preSig(ship: string): string
// Remove sig from @p
function deSig(ship: string): string
// Trim @p to short form
function cite(ship: string): string | null

// @q manipulation
// Convert a number to a @q-encoded string.
function patq(arg: string | number | BigInteger): string
function hex2patq(arg: string): string
function patq2hex(name: string): string
function patq2bn(name: string): BigInteger
function patq2dec(name: string): string
// Validate a @q string.
const isValidPatq = (str: string): boolean
// Equality comparison on @q values.
function eqPatq(p: string, q: string): boolean

// @ud manipulation
function parseUd(ud: string): BigInteger
function formatUd(ud: BigInteger): string

// @uv manipulation
function parseUv(x: string): BigInteger
function formatUv(x: BigInteger | string): string

// @uw manipulation
function parseUw(x: string): BigInteger
function formatUw(x: BigInteger | string): string

// @ux manipulation
function parseUx(ux: string): string
function formatUx(hex: string): string
``

```

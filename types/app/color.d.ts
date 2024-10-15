import {
  type Call,
  type Fn,
  type N,
  type S,
  type B,
  type Pipe,
  type _,
  type T,
} from 'hotscript';
import { IfNever, IsNumericLiteral } from 'type-fest';
type If<T, TTrue, TFalse = never> = T extends true ? TTrue : TFalse;

interface ApplyArg<V> extends Fn {
  return: Call<this['arg0'], V>;
}

type Int8<V> = Pipe<
  [N.GreaterThanOrEqual<_, 0>, N.LessThanOrEqual<_, 255>],
  [T.Map<ApplyArg<If<IsNumericLiteral<V>, V>>>, T.Every<B.Extends<true>>]
>;

type Whitespace = ' ' | '\t' | '\n' | '\r';

// no negative, whitespace inbetween, decimal point or +3 digits
// removes whitespace at begin/end
type Int8Clean<
  S extends string,
  Acc extends string = '',
  Count extends number = 0,
> = S extends `${infer First}${infer Rest}`
  ? First extends Digit
    ? Count extends 3
      ? never // too many digits
      : Int8Clean<Rest, `${Acc}${First}`, Call<N.Add<Count, 1>>>
    : First extends Whitespace
      ? Count extends 0 | 3 // whitespace only after 0 or 3 digits
        ? Int8Clean<Rest, Acc, Count>
        : never //Error<'Whitespace>'> // whitespace in wrong position
      : never //Error<'Char'> // invalid char (negative sign etc.)
  : Acc;

type ParseInt<T extends string> =
  Int8Clean<T> extends ''
    ? never // empty values are not allowed
    : Call<S.ToNumber, Int8Clean<T>>;

//type Error<T extends string> = `Error: Invalid ${T}`;

// RGB color validation
type ValidateRGB<T extends string> =
  T extends `rgb(${infer R},${infer G},${infer B})`
    ? Int8<ParseInt<R>> extends true
      ? Int8<ParseInt<G>> extends true
        ? Int8<ParseInt<B>> extends true
          ? T
          : never
        : never
      : never
    : never;

// Hex color validation
// eslint-disable-next-line prettier/prettier
type HexChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Hex = HexChar | Digit;

type StripHash<T> = T extends `#${infer S}` ? S : never;
type ParseHex<
  T,
  Acc extends string = '#',
  Index extends number = 0,
> = T extends `${infer Char}${infer Rest}`
  ? Char extends Hex
    ? Rest extends ''
      ? Index extends 2 | 5 | 7
        ? `${Acc}${Char}`
        : never
      : ParseHex<Rest, `${Acc}${Char}`, Call<N.Add<Index, 1>>>
    : never
  : never;

type ValidateHex<T extends string> = ParseHex<StripHash<T>>;

type ValidateAll<T extends string> = ValidateHex<T> | ValidateRGB<T>;

declare global {
  type ValidatedColor<T extends string> = IfNever<ValidateAll<T>, 'Color', T>;
}

type TestValidatedColor = ValidatedColor<'rgb(255, 255, 255)'>;

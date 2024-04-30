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

// provide reversed string to peano number parser
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
          : never //Error<'Blue'>
        : never //Error<'Green'>
      : never //Error<'Red'>
    : never; //Error<'RGB Format'>;

// Hex color validation
// eslint-disable-next-line prettier/prettier
type HexChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Hex = HexChar | Digit;

type StripHash<T> = T extends `#${infer S}` ? S : never; //'';
type ParseHex<
  T,
  Acc extends string = '#',
  Index extends number = 0,
> = T extends `${infer Char}${infer Rest}`
  ? Char extends Hex
    ? Rest extends ''
      ? Index extends 2 | 5 | 7
        ? `${Acc}${Char}` // final char
        : never //Error<'Hex Length'> // wrong length
      : ParseHex<Rest, `${Acc}${Char}`, Call<N.Add<Index, 1>>>
    : never //Error<'Hex Char'> // wrong char
  : never; //Error<'Hex Format'>;

type ValidateHex<T extends string> = ParseHex<StripHash<T>>;

type ValidateAll<T extends string> = ValidateHex<T> | ValidateRGB<T>;

declare global {
  type ValidatedColor<T extends string> = IfNever<
    //Call<U.Extract<T, ValidateAll<T>>>,
    //ValidateAll<T>,
    ValidateAll<T>,
    'Color',
    T
  >;
}

type TestValidatedColor = ValidatedColor<'rgb(255, 255, 255)'>;

// type MapIsFormatError = T.Map<S.EndsWith<'Format'>>;

// interface IsMixed extends Fn {
//   return: Pipe<
//     [T.Some<B.Extends<true>>, T.Some<B.Extends<false>>],
//     [T.Map<ApplyArg<this['arg0']>>, T.Every<B.Extends<true>>]
//   >;
// }

// interface DisplayErrors<V extends string[]> extends Fn {
//   return: this['arg0'] extends true
//     ? Pipe<
//         V,
//         [
//           T.Zip<Pipe<V, [MapIsFormatError]>>,
//           T.Filter<ComposeLeft<[T.Head, B.Extends<false>]>>,
//           T.Map<T.Tail>,
//           T.ToUnion,
//         ]
//       >
//     : V;
// }

// // if false, either all format errors or no errors,
// // given single values cannot be mixed
// type FilteredErrors<V extends string> = Pipe<
//   Pipe<V, [U.ToTuple]>,
//   [MapIsFormatError, IsMixed, DisplayErrors<Pipe<V, [U.ToTuple]>>, T.ToUnion]
// >;

// export type UseColorValidation<T extends string> = FilteredErrors<
//   ValidatedColor<T>
// >;

// type TestUseColorValidation = UseColorValidation<'rgb(255, 255, 255)'>;

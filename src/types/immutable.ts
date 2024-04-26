type ConcatPath<
  Prefix extends string,
  Segment extends string,
> = Prefix extends '' ? Segment : `${Prefix}.${Segment}`;

// type TestPath = PathSegments<ObjectStructure, 'hello.foo.bar.baz'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Concat<T extends any[], Acc extends string = ''> = T extends [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? Concat<Rest, `${Acc}${Acc extends '' ? '' : '.'}${First}`>
  : Acc;

type PathSegments<
  T,
  Path extends string,
  // Acc extends string[] = [],
  // Prefix extends string = '',
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends '' // If the first segment is empty
    ? PathSegments<T, Tail> // Skip the empty segment
    : Head extends keyof T // If the first segment is a key of T
      ? Tail extends string
        ? [
            Head,
            ...PathSegments<
              T[Head],
              Tail
              // [...Acc, ConcatPath<Prefix, Head>],
              // ConcatPath<Prefix, Head>
            >,
          ] // defer to the next recursion
        : never // stop when there are no more segments
      : never
  : Path extends keyof T // If the path is a key of T
    ? [Path] // add the key to the path
    : []; // otherwise don't add anything

// type PathSegments2Test = PathSegments<LightBulbState, 'color.r.g'>; // ["color", "r"]
// type ResultString = Concat<[Concat<PathSegments2Test>, 'hello']>; // "item1.item2.item3"

type PathType<
  T,
  Path extends string,
> = Path extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? PathType<T[First], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

// type PathTypeTest = PathType<LightBulbState, 'color.b'>; // string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NestedKeys<T, S extends any[]> = S extends [infer Head, ...infer Tail]
  ? Head extends keyof T
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Tail extends any[]
      ? NestedKeys<T[Head], Tail>
      : never // no more segments
    : never // invalid segment
  : T extends object
    ? [keyof T & string]
    : never;

type Intersect<T> = T extends [infer First, ...infer Rest]
  ? First & Intersect<Rest>
  : unknown;

// type NestedKeysAndIntersection<
//   T,
//   Path extends string,
// > = Path extends `${infer Head}.${infer Tail}`
//   ? Head extends keyof T
//     ? Tail extends string
//       ? NestedKeysAndIntersection<T[Head], Tail> &
//           (T[Head] extends object ? keyof T[Head] : never)
//       : never // Stop recursion if no more segments
//     : never // Stop recursion if segment is not a valid key
//   : Path extends keyof T
//     ? T[Path] extends object
//       ? keyof T[Path] & string // Intersection of keys and type
//       : never // Stop recursion if property is not an object
//     : never; // Invalid path, stop recursion

type NestedKeysAndIntersection<
  T,
  Path extends string,
  Prefix extends string = '',
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? Tail extends string
      ? NestedKeysAndIntersection<T[Head], Tail, `${Prefix}${Head}.`> &
          (T[Head] extends object
            ? `${Prefix}${Head}.${keyof T[Head] & string}`
            : never)
      : never // Stop recursion if no more segments
    : never // Stop recursion if segment is not a valid key
  : Path extends keyof T
    ? T[Path] extends object
      ? `${Prefix}${Path}.${keyof T[Path] & string}` // Intersection of keys and type
      : never // Stop recursion if property is not an object
    : `${Prefix}${keyof T & string}`; // Return keys of the root type when path is empty

// type NestedKeysAndIntersectionTest = NestedKeysAndIntersection<
//   LightBulbState,
//   'color'
// >;

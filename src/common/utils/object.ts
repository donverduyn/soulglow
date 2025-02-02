// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const merge = <T extends Record<any, any>, U extends Record<any, any>>(
  first: T,
  second: U
) => Object.assign({}, first, second);

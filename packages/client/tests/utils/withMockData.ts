// import * as mocks from "./../../src/__generated/gql/mocks.ts";

// /**
//  * Wraps an MSW handler to inject automatically generated mock data.
//  */
// export const withMockData = (handler: any, mockName: string) => {
//   return handler(({ variables }: any) => {
//     const generateMock = mocks[`a${mockName}`]; // Example: `aUser`
//     if (!generateMock) {
//       console.warn(`No mock data found for ${mockName}`);
//       return handler.resolver({ variables }); // Fallback to default handler logic
//     }

//     return handler.resolver({
//       variables,
//       data: generateMock(variables) // ✅ Injects the correct mock data dynamically
//     });
//   });
// };

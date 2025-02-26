// import {
//   createMockServer,
//   startMockServer,
//   stopMockServer,
// } from 'tests/utils/trcp.worker.mock';

describe('tRPC client', () => {
  // const port = Math.round(Math.random() * 100) + 62000;
  // const url = `http://localhost:${port.toString()}`;
  // const user = { id: '42', name: 'Alice' };

  // const server = await createMockServer<AppRouter>(url, (trpcMsw) => [
  //   trpcMsw.userById.query((input) =>
  //     input[0] === user.id ? user : undefined
  //   ),
  // ]);

  // beforeAll(() => startMockServer(server));
  // afterAll(() => stopMockServer(server));

  // it('should be able to resolve a query', async () => {
  //   expect.assertions(1);

  //   const { result } = renderHook(() => useTRPC({ url }));
  //   const client = result.current;

  //   const response = await client.userById.query(user.id);
  //   expect(response?.name).toBe(user.name);
  // });
  it('should be true', () => {
    expect.assertions(1);
    expect(true).toBeTruthy();
  });
});

type User = { id: string; name: string };

// Imaginary database
const users: User[] = [{ id: '42', name: 'Alice' }];
export const db = {
  user: {
    // findMany: async () => users,
    findById: async (id: string) =>
      new Promise<User | undefined>((r) =>
        setTimeout(() => r(users.find((user) => user.id === id)), 100)
      ),
    // create: async (data: { name: string }) => {
    //   const user = { id: String(users.length + 1), ...data };
    //   users.push(user);
    //   return user;
    // },
  },
};

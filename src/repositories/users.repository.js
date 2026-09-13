import { readFile, writeFile } from 'node:fs/promises';

const usersFile = new URL('../data/users.json', import.meta.url);

const readUsers = async () => {
  const data = await readFile(usersFile, 'utf8');

  return JSON.parse(data);
};

const writeUsers = async (users) => {
  await writeFile(usersFile, JSON.stringify(users, null, 2));
};

export const usersRepository = {
  async findAll() {
    return readUsers();
  },

  async findById(id) {
    const users = await readUsers();

    return users.find((user) => user.id === id);
  },

  async findByUsername(username) {
    const users = await readUsers();

    return users.find((user) => user.username === username);
  },

  async create(user) {
    const users = await readUsers();

    users.push(user);

    await writeUsers(users);

    return user;
  },

  async update(id, updates) {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) return undefined;

    users[index] = {
      ...users[index],
      ...updates,
    };

    await writeUsers(users);

    return users[index];
  },

  async replace(id, updates) {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) return undefined;

    users[index] = {
      id: id,
      ...updates,
    };

    await writeUsers(users);

    return users[index];
  },

  async delete(id) {
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) return undefined;

    const [deletedUser] = users.splice(index, 1);

    await writeUsers(users);

    return deletedUser;
  },
};

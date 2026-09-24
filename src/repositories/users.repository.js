import { mongoRepository } from './mongodb.repository.js';

const COLLECTION = 'users';

export const usersRepository = {
  async findAll() {
    return mongoRepository.findDocuments(COLLECTION);
  },

  async findById(_id) {
    return mongoRepository.findDocument(COLLECTION, _id);
  },

  async findByUsername(username) {
    return mongoRepository.findDocument(COLLECTION, username);
  },

  async findByEmail(email) {
    return mongoRepository.findDocument(COLLECTION, { email });
  },

  async createOne(user) {
    return mongoRepository.insertDocument(COLLECTION, user);
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

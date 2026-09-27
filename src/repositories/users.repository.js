import { ObjectId } from 'mongodb';
import { mongoRepository } from './mongodb.repository.js';

const COLLECTION = 'users';

const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

const toUser = (doc) => {
  if (!doc) return null;

  const { _id, ...rest } = doc;

  return { ...rest, id: _id.toString() };
};

export const usersRepository = {
  async findAll() {
    const docs = await mongoRepository.findDocuments(COLLECTION);

    return docs.map(toUser);
  },

  async findById(id) {
    const _id = toObjectId(id);

    if (!_id) return null;

    return toUser(await mongoRepository.findDocument(COLLECTION, { _id }));
  },

  async findByEmail(email) {
    return toUser(await mongoRepository.findDocument(COLLECTION, { email }));
  },

  async createOne(user) {
    return toUser(await mongoRepository.insertDocument(COLLECTION, user));
  },

  async update(id, changes) {
    const _id = toObjectId(id);

    if (!_id) return null;

    return toUser(
      await mongoRepository.updateDocument(COLLECTION, { _id }, changes),
    );
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

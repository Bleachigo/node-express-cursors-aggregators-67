import { getCollection } from '../config/mongodb.config.js';

export const mongoRepository = {
  async insertDocument(collectionName, document) {
    const collection = getCollection(collectionName);
    const result = await collection.insertOne(document);

    return {
      ...document,
      _id: result.insertedId,
    };
  },

  async findDocument(collectionName, filter, options = {}) {
    return getCollection(collectionName).findOne(filter, options);
  },

  async findDocuments(collectionName, filter = {}, options = {}) {
    return getCollection(collectionName).find(filter, options).toArray();
  },

  async updateDocument(collectionName, filter, changes, options = {}) {
    return getCollection(collectionName).findOneAndUpdate(
      filter,
      { $set: changes },
      { returnDocument: 'after', ...options },
    );
  },

  async deleteDocument(collectionName, filter, options = {}) {
    return getCollection(collectionName).findOneAndDelete(filter, options);
  },
};

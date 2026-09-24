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

  async findDocument(collectionName, filter) {
    const collection = getCollection(collectionName);

    return collection.findOne(filter);
  },

  async findDocuments(collectionName) {
    const collection = getCollection(collectionName);

    return collection.find();
  },
};

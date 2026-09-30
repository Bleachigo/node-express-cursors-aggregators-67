import { ObjectId } from 'mongodb';
import { mongoRepository } from './mongodb.repository.js';

const COLLECTION = 'balloons';
const toBalloon = ({ _id, ...rest }) => ({ ...rest, id: _id.toString() });
const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

export const balloonsRepository = {
  async createMany(balloons) {
    const docs = await mongoRepository.insertDocuments(COLLECTION, balloons);

    return docs.map(toBalloon);
  },

  async updateBalloon(id, changes, options) {
    const _id = toObjectId(id);

    if (!_id) return null;

    return await mongoRepository.updateOne(
      COLLECTION,
      { _id },
      changes,
      options,
    );
  },

  async updateBalloons(query, changes, options) {
    return await mongoRepository.updateDocuments(
      COLLECTION,
      query,
      changes,
      options,
    );
  },
};

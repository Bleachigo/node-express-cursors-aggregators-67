import { mongoRepository } from './mongodb.repository.js';

const COLLECTION = 'balloons';
const toBalloon = ({ _id, ...rest }) => ({ ...rest, id: _id.toString() });

export const balloonsRepository = {
  async createMany(balloons) {
    const docs = await mongoRepository.insertDocuments(COLLECTION, balloons);

    return docs.map(toBalloon);
  },
};

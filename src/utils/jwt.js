import jwt from 'jsonwebtoken';

export const createToken = (userId) => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId,
    expiresIn: '1h',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

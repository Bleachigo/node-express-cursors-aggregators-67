export const rootController = {
  getRoot(req, res) {
    req.session.visits = (req.session.visits ?? 0) + 1;
    res.send(`Get root route. Session visits: ${req.session.visits}`);
  },
};

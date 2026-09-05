module.exports = (_req, res) => {
  res.status(200).json({ service: 'maya-azma-api', status: 'ready' });
};

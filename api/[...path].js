let appPromise;

module.exports = async (req, res) => {
  appPromise ||= import('../backend/src/app.js').then(({ app }) => app);
  const app = await appPromise;
  return app(req, res);
};

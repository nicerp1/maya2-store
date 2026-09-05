let appPromise;

module.exports = async (req, res) => {
  // Vercel keeps the legacy DATABASE_URL variable for local compatibility.
  // Prefer the production-only secret when the legacy value is empty.
  if (!process.env.DATABASE_URL && process.env.MAYA_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.MAYA_DATABASE_URL;
  }
  appPromise ||= import('../backend/src/app.js').then(({ app }) => app);
  const app = await appPromise;
  return app(req, res);
};

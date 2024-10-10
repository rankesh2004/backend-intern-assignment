const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== undefined) {
    const jwtToken = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(jwtToken, "secret");  
      req.user = decoded;
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Access denied. No token provided.' });
  }
};

const authenticateAdmin = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied: Admins only' });
    next();
  });
};

module.exports = { authenticateUser, authenticateAdmin };

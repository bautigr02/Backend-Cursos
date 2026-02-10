
const authorize = (rolesPermitidos) => {
  return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json({ error: 'Acceso denegado: no tienes permisos suficientes' });
    }
    next();
  };
};

module.exports = authorize;
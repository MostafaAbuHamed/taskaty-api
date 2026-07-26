function Router() {
  this.routes = [];
}

Router.prototype.get = function (path, handler) {
  this.routes.push({ method: 'GET', path, handler });
};

Router.prototype.post = function (path, handler) {
  this.routes.push({ method: 'POST', path, handler });
};

Router.prototype.put = function (path, handler) {
  this.routes.push({ method: 'PUT', path, handler });
};

Router.prototype.delete = function (path, handler) {
  this.routes.push({ method: 'DELETE', path, handler });
};

Router.prototype.match = function (method, pathname) {
  for (const rout of this.routes) {
    if (rout.method === method && rout.path === pathname) {
      return { handler: rout.handler, params: {} };
    }
  }
  return null;
};

module.exports = Router;

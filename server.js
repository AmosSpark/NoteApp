const routes = require("./src/routes");

const server = routes;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`App now running on port: ${PORT}`));

const http = require("http");

const url = require("url");
const controller = require("./controller");

module.exports = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (pathname && req.method === "POST") {
    // create dirs for notes
    controller.createDirWithFile(req, res);
    // create note
    controller.createNote(req, res);
  } else if (pathname === "/directories" && req.method === "GET") {
    // get all directories
    controller.listDir(req, res);
  } else if (pathname && req.method === "GET") {
    // get all notes
    controller.get_All_Notes(req, res);
  } else if (pathname && query && req.method === "PUT") {
    // update a note in a dir
    controller.update_A_Note(req, res);
  } else if (pathname && query && req.method === "DELETE") {
    // delete a note
    controller.delete_A_Note(req, res);
  } else {
    // response
    res.writeHead(404, { "Content-type": "application/json" });
    return res.end(
      `{"status": "fail", "error": "Unable to locate ${req.url} on this server"}`
    );
  }
});

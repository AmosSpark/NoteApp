const fs = require("fs").promises;

const crypto = require("crypto");
const url = require("url");

/*
 * @route: POST /pathname
 * @desc: create a dir with a .json file
 * ex: /events
 */

exports.createDirWithFile = (req, res) => {
  const { pathname } = url.parse(req.url, true);
  // create dir
  fs.mkdir(`${__dirname}/dir/${pathname}`, {}).then(() => {
    // create file
    fs.writeFile(`${__dirname}/dir/${pathname}/${pathname}.json`, `[]`)
      .then(() => {
        // response
        res.writeHead(201, { "Content-type": "application/json" });
        res.end(
          `{"status": "success", "message": "Directory ${pathname}  with file ${pathname}.json created" }`
        );
      })
      .catch((err) => {
        // response
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(
          `{"status": "fail", "error": "Unable to create file", "${err}"}`
        );
      })
      .catch((err) => {
        // response
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(
          `{"status": "fail", "error": "Unable to create directory", "${err}"}`
        );
      });
  });
};

/*
 * @route: GET /pathname
 * @desc: get all dir
 * ex: /directories
 */

exports.listDir = (req, res) => {
  fs.readdir(`${__dirname}/dir`)
    .then((data) => {
      // response
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(
        `{"status": "success", "result": ${
          data.length
        } ,"data": [${JSON.stringify(data)}]}`
      );
    })
    .catch((err) => {
      // response
      res.writeHead(500, { "Content-type": "application/json" });
      return res.end(
        `{"status": "fail", "error": "Unable to read directory", "${err}"}`
      );
    });
};

/*
 * @route: POST /pathname
 * @desc: create a note
 * ex: /events
 */

exports.createNote = (req, res) => {
  const { pathname } = url.parse(req.url, true);
  // body-parser
  body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    postBody = JSON.parse(body);

    // read file
    fs.readFile(`${__dirname}/dir/${pathname}/${pathname}.json`, "utf-8")
      .then((files) => {
        // copy and convert files to obj
        const filesObj = JSON.parse(files);
        // set id
        postBody.id = crypto.randomBytes(16).toString("hex");
        // set date
        postBody.date = new Date()
          .toISOString()
          .replace(/T/, " ") // replace T with a space
          .replace(/\..+/, ""); // delete dot and everything after
        //  push incoming note to existing note
        filesObj.push(postBody);
        // rewrite note and save
        fs.writeFile(
          `${__dirname}/dir/${pathname}/${pathname}.json`,
          JSON.stringify(filesObj)
        )
          .then(() => {
            // response
            res.writeHead(201, { "Content-type": "application/json" });
            res.end(
              `{"status": "success", "data": ${JSON.stringify(postBody)}}`
            );
          })
          .catch((err) => {
            // response
            res.writeHead(500, { "Content-type": "application/json" });
            return res.end(
              `{"status": "fail", "error": "Unable to write to file", "${err}"}`
            );
          });
      })
      .catch((err) => {
        // dir will be created if it dosent't exist
        // response
        res.writeHead(201, { "Content-type": "application/json" });
        res.end(
          `{"status": "success", "message": "Directory ${pathname}  and file ${pathname}.json created" }`
        );
      });
  });
};

/*
 * @route: GET /pathname
 * @desc: get all notes in a dir
 * ex: /events
 */

exports.get_All_Notes = (req, res) => {
  const { pathname } = url.parse(req.url, true);
  // read file
  fs.readFile(`${__dirname}/dir/${pathname}/${pathname}.json`, "utf-8")
    .then((data) => {
      // response
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(
        `{"status": "success","result": ${
          JSON.parse(data).length
        } ,"data": ${data}}`
      );
    })
    .catch((err) => {
      // response
      res.writeHead(500, { "Content-type": "application/json" });
      return res.end(
        `{"status": "fail", "error": "Unable to read file", "${err}" }`
      );
    });
};

/*
 * @route: PUT /pathname?query
 * @desc: update a note
 * ex: /events?id=1
 */

exports.update_A_Note = (req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  // body-parser
  body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    postBody = JSON.parse(body);
    // read file
    fs.readFile(`${__dirname}/dir/${pathname}/${pathname}.json`, "utf-8")
      .then((files) => {
        // copy and convert files to obj
        const filesObj = JSON.parse(files);
        // find note by id
        const findById = filesObj.find((file) => file.id === query.id);
        // set id of note found
        postBody.id = findById.id;
        // set date
        postBody.date = new Date()
          .toISOString()
          .replace(/T/, " ") // replace T with a space
          .replace(/\..+/, ""); // delete dot and everything after
        // find index of note
        const index = filesObj.indexOf(findById);
        // update note
        filesObj.splice(index, 1, postBody);
        // write updated note to file
        fs.writeFile(
          `${__dirname}/dir/${pathname}/${pathname}.json`,
          JSON.stringify(filesObj)
        )
          .then(() => {
            // response
            res.writeHead(200, { "Content-type": "application/json" });
            res.end(
              `{"status": "success"}, {"data": ${JSON.stringify(postBody)}}`
            );
          })
          .catch((err) => {
            // response
            res.writeHead(500, { "Content-type": "application/json" });
            return res.end(
              `{"status": "fail", "error": "Unable to write to file", "${err}"}`
            );
          });
      })
      .catch((err) => {
        // response
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(
          `{"status": "fail", "error": "Unable to read file", "${err}"}`
        );
      });
  });
};

/*
 * @route: DELETE /pathname?query
 * @desc: delete a note
 * ex: /events?id=1
 */

exports.delete_A_Note = (req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  // read file
  fs.readFile(`${__dirname}/dir/${pathname}/${pathname}.json`, "utf-8")
    .then((files) => {
      // copy and convert files to obj
      const filesObj = JSON.parse(files);
      // find note by id
      const findById = filesObj.find((file) => file.id === query.id);
      // find index of note
      const index = filesObj.indexOf(findById);
      // remove note
      filesObj.splice(index, 1);

      // IF THE LAST NOTE IS REMOVED, DELETE DIR

      if (filesObj.length === 0) {
        // remove dir
        fs.rmdir(`${__dirname}/dir/${pathname}`, { recursive: true })
          .then(() => {
            // response
            res.writeHead(204, { "Content-type": "application/json" });
            res.end(`{"status": "success", "data": ${null}}`);
          })
          .catch((err) => {
            // response
            res.writeHead(500, { "Content-type": "application/json" });
            return res.end(
              `{"status": "fail", "error": "Unable to delete directory", "${err}"}`
            );
          });
      } else {
        // rewrite and save file
        fs.writeFile(
          `${__dirname}/dir/${pathname}/${pathname}.json`,
          JSON.stringify(filesObj)
        )
          .then(() => {
            // response
            res.writeHead(204, { "Content-type": "application/json" });
            res.end(`{"status": "success", "data": ${null}}`);
          })
          .catch((err) => {
            // response
            res.writeHead(500, { "Content-type": "application/json" });
            return res.end(
              `{"status": "fail", "error": "Unable to write to file", "${err}"}`
            );
          });
      }
    })
    .catch((err) => {
      // response
      res.writeHead(500, { "Content-type": "application/json" });
      return res.end(
        `{"status": "fail", "error": "Unable to read file", "${err}"}`
      );
    });
};

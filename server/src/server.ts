import { createConnection } from "./database";
import { serverHttp } from "./http";
createConnection()
  .then(() => console.log("mongoDB connected"))
  .catch((err) => console.error("Error connect mongoDB:", err));

import "./websocket";

serverHttp.listen(5000, () => {
  console.log("server started on port 5000");
});

import superagent from "superagent";
import history from "hist";

const agent = superagent.agent();

agent.use(req => {
  if (req.url[0] === "/" && req.url.indexOf("/api/v1/") !== 0) {
    req.url = "/api/v1" + req.url;
  }

  req.on("error", err => {
    if (!req._header["x-ignore"]) {
      let body = err.response.body;
      history.push("/", { error: true, body });
    }
  });

  req.parse(function(res, txt) {
    let accept = req._header["accept"] || null;
    let contentType = res.type || null;

    if (res.req.url.indexOf("/api") === 0) {
      // lets camelize.
      let newBody = JSON.parse(txt, function(key, value) {
        if (key === "attributes") {
          let newObj = {};

          for (let childKey in value) {
            if (childKey.indexOf("_") !== -1) {
              let camelKey = childKey.replace(/_([a-z])/g, function(match, nextLetter) {
                return nextLetter.toUpperCase();
              });
              newObj[camelKey] = value[childKey];
              continue;
            }
            newObj[childKey] = value[childKey];
          }
          return newObj;
        }
        return value;
      });
      return newBody;
    }

    // If there's an accept header set, give it precedence.
    if (accept !== null && superagent.parse[accept]) {
      return superagent.parse[accept](txt);
    }

    // If there's a contentType, give it precedence after accept.
    if (contentType !== null && superagent.parse[contentType]) {
      return superagent.parse[contentType](txt);
    }

    return txt;
  });
});

export default agent;

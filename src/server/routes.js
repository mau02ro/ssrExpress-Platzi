import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { StaticRouter } from "react-router-dom";
import { renderRoutes } from "react-router-config";

import reducer from "../frontend/reducers/index";
import Layout from "../frontend/components/Layout";
import { initialState } from "../frontend/initialState";
import { routes } from "../frontend/routes/serverRoutes";

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest["main.css"] : "assets/main.css";
  const mainBuild = manifest ? manifest["main.js"] : "assets/main.js";
  const vendorBuild = manifest ? manifest["vendors.js"] : "assets/vendor.js";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PlatziVideo</title>

        <link rel="stylesheet" href=${mainStyles} type="text/css" >
      </head>
      <body>
        <div id="app">${html}</div>
         <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
            /</g,
            "\\u003c"
          )}
        </script>
        <script src=${vendorBuild} type="text/javascript" ></script>
        <script src=${mainBuild} type="text/javascript" ></script>
      </body>
    </html>
  `;
};

const renderApp = (req, res) => {
  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        <Layout>{renderRoutes(routes)}</Layout>
      </StaticRouter>
    </Provider>
  );

  res.send(setResponse(html, preloadedState, req.hashManifest));
};

export default renderApp;

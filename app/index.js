(function () {
  var express   = require('express'),
    bodyParser  = require('body-parser'),
    app         = express(),
    port        = Number(process.env.PORT || 8000),
    server;


  /**
   * This function tests the result we pass in to check
   * that the drm value is true and that the episode count
   * is one or more
   * @param {Object} result
   * @returns {boolean} true if has drm and more than 0 episodes
   */
  function filterResults(result) {
    return (result.drm === true && result.episodeCount > 0);
  }

  /**
   * This function maps the result object to an object
   * containing an image, slug and title
   * @param result
   * @returns {Object}
   */
  function mapResults(result) {
    return {
      image: result.image.showImage,
      slug: result.slug,
      title: result.title
    };
  }

  /**
   * This function checks that we have a payload in the jsonObj we pass in,
   * and then does a filter then map on the array.
   * @param {Object} jsonObj
   * @returns {Array}
   */
  function filterAndMapPayload(jsonObj) {
    var payload;
    if (!jsonObj || !jsonObj.payload) {
      console.log('filterAndMapPayload : Invalid JSON Object');
      return;
    }
    payload = jsonObj.payload;
    return payload.filter(filterResults).map(mapResults);
  }

  /**
   * This function abstracts out the error response so we
   * don't duplicate the code when we call hit an error state at different
   * stages of our code path
   * @param {Object} res - the response object
   */
  function errResponse(res) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.send({
      "error": "Could not decode request: JSON parsing failed"
    });
  }

  /**
   * This is the function that is called when you hit the root URL of this
   * application, we pass it a request and response object.
   * @param {Object} req
   * @param {Object} res
   */
  function codingChallenge(req, res) {
    var payload;

    if (!req.is('json')) {
      errResponse(res);
      return;
    }

    payload = filterAndMapPayload(req.body);

    if (!payload) {
      errResponse(res);
      return;
    }
    res.header(200);
    res.send(payload);
  }

  /**
   * Here we tell express to use the bodyParser.json middleware
   */
  app.use(bodyParser.json());

  /**
   * Here we tell express accept requests from any origin to
   * avoid CORS errors
   */
  app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  /**
   * Here we set up our route
   */
  app.post('/', codingChallenge);

  /**
   * And here we set up our server to listen on a port, either
   * a port set up on an environment variable or port 8000
   * @type {http.Server}
   */
  server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
  });

})();
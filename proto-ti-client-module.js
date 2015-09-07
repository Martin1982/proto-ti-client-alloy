/**
 * Proto-ti Client
 **/
var string = require('alloy/string'),
  io = require('socket.io'),
  ws, componentTree, $;

/**
 * Initiate interception of elements
 * @param {Ti.UI.*} rootElement
 */
function startInterception(rootElement) {

  if (rootElement.window) {
    return startInterception(rootElement.window);
  }

  rootElement.addEventListener('click', function(e){
    e.cancelBubble = true;
    if (rootElement.id) {
      ws.emit('element', rootElement);
    }
  });

  if (!rootElement.children || rootElement.children.length <= 0) {
    return;
  }

  for (var i = 0; i < rootElement.children.length; i++) {
    startInterception(rootElement.children[i]);
  }
}

/**
 * Update a UI component
 * @param {Object} data
 */
function updateComponent(data) {
  var component;

  if (data['id']) {
    component = $.getView(data['id']);
  }

  if (component && data['property'] && data['value']) {
    component['set' + string.ucfirst(data['property'])](data['value']);
  }

  //function findElement(id, children) {
  //  // Iterate tags
  //  if (children) {
  //    children.forEach(function (tag) {
  //      // If current tag has an id property
  //      if (tag['id'] && tag['id'] === id) {
  //        tag['set' + string.ucfirst(data['property'])](data['value']);
  //      }
  //      // think about the children!
  //      findElement(id, tag.views || tag.children);
  //    });
  //  }
  //
  //}
  //findElement(data['id'], [__parentSymbol]);
}

function initPrototyping() {
  Ti.API.info('Proto-ti client connected to the server...');
  ws.on('refresh-element', updateComponent);
  if (componentTree[0] && componentTree[0].open) {
    startInterception(componentTree[0]);
  }

  // @todo make it visual that proto-ti is running...
}

/**
 * Close the Websocket connection
 */
function closeConnection(e){
  Ti.API.info('The connection to the proto-ti server closed; ' + JSON.stringify(e));
}

/**
 * Handle Websocket errors
 * @param e
 */
function socketError(e){
  Ti.API.debug('A proto-ti related websocket error occured: ' + JSON.stringify(e));
}

function connectWs() {
  ws = io.connect('ws://' + Alloy.CFG.prototi.server + ':' + Alloy.CFG.prototi.port);
  ws.on('connect', initPrototyping);
  ws.on('disconnect', closeConnection);
  ws.on('error', socketError);
}

/**
 * Bootstrap proto-ti
 * @param {Alloy.Controller} alloyController
 */
module.exports = function(alloyController) {
  if (!Alloy.CFG.prototi) {
    return;
  }

  $ = alloyController;
  componentTree = alloyController.getTopLevelViews();
  connectWs();
};
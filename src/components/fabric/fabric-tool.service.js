import { fabric } from 'fabric';
import { CarryOutOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { upload } from "./minio.service";

// misc
fabric.NamedImage = fabric.util.createClass(fabric.Image, {
  type: 'named-image',
  initialize: function(element, options) {
    this.callSuper('initialize', element, options);
    options && this.set('name', options.name);
  },
  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), { name: this.name });
  }
});
fabric.NamedImage.fromObject = function(object, callback) {
  fabric.util.loadImage(object.src, function(img) {
    callback && callback(new fabric.NamedImage(img, object));
  });
};
fabric.NamedImage.async = true;

/**
 * To initialise canvas with given config
 * @param canvasId id given for the canvas HTML element
 * @param canvasConfig object contains {height, width, backgroundColor, selection, preserveObjectStacking}
 */
const initCanvas = (canvasId, canvasConfig) => (
  new fabric.Canvas(canvasId, canvasConfig)
);

/**
 * save's canvas as json on the respective node, so that we can load the canvas with the json again
 * @param nodeList constructed node's in list
 * @param canvasInstance canvas instance loaded while fabric-editor mounted
 * @param id id of the respective node
 * @param additionalParams while exporting to json, specify addition attributes to save in actual object
 */
const saveCanvas = (nodeList, canvasInstance, id, additionalParams = []) => {
  let node = _.find(nodeList, {id: id});
  if (node) {
    node['srcData'] = canvasInstance.toJSON(additionalParams);
  }
};

/**
 * creates node
 * @param id unique id
 * @param title node tile
 * @param parent parent node id
 * @returns {{parent, icon: JSX.Element, id, title}}
 */
const createNode = (id, title, parent) => ({
  id: id,
  title: title,
  parent: parent,
  icon: <CarryOutOutlined />
});

const addImageToCanvas = (canvasInstance, currentNodeId) => {
  upload(canvasInstance, currentNodeId);

  // temp image service
  // fabric.Image.fromURL(`https://picsum.photos/id/${currentNodeId}/600/600`, (oImg) => {
  //   canvasInstance.add(oImg);
  // });
};

/**
 * creates a rectangle object with given specification (Blue Rectangle)
 * @param canvasInstance canvas instance loaded while fabric-editor mounted
 * @param rectConfig rectangle configuration object {height, width, fill, stroke, strokeWidth}
 * @param nodeList list contains all the created nodes
 * @param nodeId unique node id
 * @param currentNodeId selected node id (parent)
 * @param setNodeList update the node list with newly created node
 * @param incrementNodeId once node id is consumed(unique), increment to next id.
 */
const createAreaOfInspection = (canvasInstance, rectConfig, nodeList, nodeId, currentNodeId, setNodeList, incrementNodeId) => {
  const rect = new fabric.Rect(rectConfig);
  rect.set('linkedNodeId', nodeId);
  rect.set('nodeType', 'BLUERECT');
  canvasInstance.add(rect);
  canvasInstance.renderAll();
  // updating tree
  let tempList = _.cloneDeep(nodeList);
  tempList.push(createNode(nodeId, 'child', currentNodeId));
  setNodeList(tempList);
  incrementNodeId();
  saveCanvas(nodeList, canvasInstance, currentNodeId, ['linkedNodeId', 'nodeType']);
};

/**
 * creates a rectangle object with given specification (Red Rectangle)
 * @param canvasInstance canvas instance loaded while fabric-editor mounted
 * @param rectConfig rectangle configuration object {height, width, fill, stroke, strokeWidth}
 * @param nodeList list contains all the created nodes
 * @param currentNodeId selected node id (parent)
 */
const createPointOfInspection = (canvasInstance, rectConfig, nodeList, currentNodeId) => {
  const rect = new fabric.Rect(rectConfig);
  rect.set('nodeType', 'REDRECT');
  canvasInstance.add(rect);
  canvasInstance.renderAll();
  saveCanvas(nodeList, canvasInstance, currentNodeId, ['linkedNodeId', 'nodeType']);
};

// introduce modeType parameter in rect to store blueRect or redRect
// if red no need to find linked node else get linked node and delete it from nodeList
// so the we will have updated tree...
/**
 * deletes selected object/element in canvas
 * @param canvasInstance canvas instance loaded while fabric-editor mounted
 * @param nodeList list contains all the created nodes
 * @param setNodeList update the node list with newly created node
 */
const deleteCanvasElement = (canvasInstance, nodeList, setNodeList) => {
  if (canvasInstance.getActiveObject().nodeType === 'BLUERECT') {
    let nextNodeIdToRemove = canvasInstance.getActiveObject().linkedNodeId;
    let filteredArray = _.filter(nodeList, (obj) => obj.id !== nextNodeIdToRemove);
    while (nextNodeIdToRemove != null) {
      let terminate = true;
      // removing  object which has deleted node id (in previous remove call) as parent id.
      filteredArray.forEach((obj, index, arr) => {
        if (obj.parent === nextNodeIdToRemove) {
          nextNodeIdToRemove = obj.id;
          terminate = false;
          arr.splice(index, 1);
        }
      });
      // to terminate while loop running more than node list time.
      if (terminate) {
        nextNodeIdToRemove = null;
      }
    }
    // updating new node list in state
    setNodeList(filteredArray);
  }
  canvasInstance.remove(canvasInstance.getActiveObject());
  canvasInstance.renderAll();
};

/**
 * reset's the canvas, node list and tree structure
 * @param canvasInstance canvas instance loaded while fabric-editor mounted
 * @param setClearAllFlag boolean value used to reset the canvas
 * @param setCurrentNodeId method used to set the current node id. default value 1
 * @param setNodeId method used to set node id. default value 1
 * additional methods to consider in future
 * @function canvasInstance.clear();
 * @function canvasInstance.remove(...canvasInstance.getObjects());
 * */
const clearCanvas = (canvasInstance, setClearAllFlag, setCurrentNodeId, setNodeId) => {
  setClearAllFlag(true);
  setCurrentNodeId(1);
  setNodeId(1);
  canvasInstance.clear();
};

export {
  initCanvas,
  saveCanvas,
  createNode,
  addImageToCanvas,
  createAreaOfInspection,
  createPointOfInspection,
  deleteCanvasElement,
  clearCanvas
};

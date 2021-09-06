import _ from 'lodash';
import {saveCanvas} from "../fabric/fabric-tool.service";

/**
 * method construct's tree structure required for ant tree
 * @param list list of nodes
 * @param idAttr name of the id attribute. default value 'id'
 * @param parentAttr name of the parentAttr. default value 'parent'
 * @param childrenAttr name of the children attribute. default value 'children'
 * @returns {*[]}
 */
const constructTree = (
  list, idAttr = 'id',
  parentAttr = 'parent',
  childrenAttr = 'children'
  ) => {
  let treeList = [];
  let lookup = {};
  list.forEach((obj) => {
    obj['key'] = getKey(obj.id, list);
  });
  list.forEach((obj) => {
    lookup[obj[idAttr]] = obj;
    obj[childrenAttr] = [];
  });
  list.forEach((obj) => {
    if (obj[parentAttr] != null) {
      lookup[obj[parentAttr]][childrenAttr].push(obj);
    } else {
      treeList.push(obj);
    }
  });
  return treeList;
};

/**
 * construct's key to uniquely identify tree element in a format required for ant tree
 * @param id node id
 * @param list node list
 * @returns {string} key (ex: 1-2-4)
 */
const getKey = (id, list) => {
  let isParentIdNotNull = true;
  let nextId = id;
  let result = [];
  result.push(id);

  while (isParentIdNotNull) {
    let obj = _.find(list, {id: nextId});
    if (obj.parent !== null) {
      result.push(obj.parent);
      nextId = obj.parent;
    } else {
      isParentIdNotNull = false;
    }
  }

  return result.reverse().map(e => e).join('-');
};

/**
 * method to update current selected element id in tree
 * @param selectedKeys given by callback method - ant tree
 * @param info given by callback method - ant tree
 * @param canvas canvas instance loaded while fabric-editor mounted
 * @param nodeList list contains all the created nodes
 * @param currentNodeId selected node id (parent)
 * @param setCurrentNodeId method used to set the current node id. default value 1
 */
const treeElementOnSelect = (selectedKeys, info, canvas, nodeList, currentNodeId, setCurrentNodeId) => {
  saveCanvas(nodeList, canvas, currentNodeId, ['linkedNodeId', 'nodeType']);
  canvas.remove(...canvas.getObjects());
  setCurrentNodeId(info.node.id);
  const currentNodeSrcData = _.find(nodeList, {id: info.node.id});
  canvas.loadFromJSON(currentNodeSrcData.srcData);
};

export {
  constructTree,
  treeElementOnSelect
};
import React, { useEffect, useState } from 'react';
import { Row, Col, Tree } from 'antd';
import './fabric-editor.scss';
import ToolSet from './toolset';
import {
  initCanvas,
  createNode,
  addImageToCanvas,
  createAreaOfInspection,
  createPointOfInspection,
  deleteCanvasElement,
  clearCanvas
} from './fabric-tool.service';
import { constructTree, treeElementOnSelect } from '../tree/tree-structure.service';

const FabricEditor = props => {

  // state declarations
  const [canvas, setCanvas] = useState('');
  const [currentNodeId, setCurrentNodeId] = useState(1);
  const [nodeId, setNodeId] = useState(1);
  const [nodeList, setNodeList] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [clearAllFlag, setClearAllFlag] = useState(false);

  // custom/config constants
  const nextRectConfig = {
    height: 200,
    width: 200,
    fill: 'rgba(255, 255, 255, 0.0)',
    stroke: '#00008B',
    strokeWidth: 3,
  }
  const finalRectConfig = {
    height: 200,
    width: 200,
    fill: 'rgba(255, 255, 255, 0.0)',
    stroke: '#FF0000',
    strokeWidth: 3,
  }
  const canvasConfig = {
    height: 745,
    width: 1170,
    backgroundColor: '#FFFFFF',
    selection: false,
    preserveObjectStacking: true
  };

  // method reference from service
  const incrementNodeId = () => setNodeId(nodeId + 1);
  const loadImage = () => addImageToCanvas(canvas, currentNodeId);
  const addNextRect = () => createAreaOfInspection(canvas, nextRectConfig, nodeList, nodeId, currentNodeId, setNodeList, incrementNodeId);
  const addFinalRect = () => createPointOfInspection(canvas, finalRectConfig, nodeList, currentNodeId);
  const deleteObject = () => deleteCanvasElement(canvas, nodeList, setNodeList);
  const clearAll = () => clearCanvas(canvas, setClearAllFlag, setCurrentNodeId, setNodeId);
  const onSelect = (selectedKeys, info) => treeElementOnSelect(selectedKeys, info, canvas, nodeList, currentNodeId, setCurrentNodeId);

  useEffect(() => {
    setCanvas(initCanvas('canvas', canvasConfig));
    let tempNodeList = [];
    tempNodeList.push(createNode(nodeId, 'root', null));
    setNodeList(tempNodeList);
    incrementNodeId();
  }, []);

  // once node list updated, convert the list into tree data
  useEffect(() => {
    setTreeData(constructTree(nodeList));
  }, [nodeList]);

  useEffect(() => {
    if (canvas) {
      console.info("canvas loaded");
    }
  }, [canvas]);

  useEffect(() => {
    if (clearAllFlag && nodeId && currentNodeId && nodeId === 1 && currentNodeId === 1) {
      let tempNodeList = [];
      tempNodeList.push(createNode(nodeId, 'root', null));
      setNodeList(tempNodeList);
      incrementNodeId();
      setClearAllFlag(false);
    }
  }, [clearAllFlag, nodeId, currentNodeId]);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ToolSet 
            canvas={canvas}
            loadImage={loadImage}
            addFinalRect={addFinalRect}
            addNextRect={addNextRect}
            deleteObject={deleteObject}
            clearAll={clearAll}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={18} height="100%">
          <div className='responsive-canvas-container'>
            <canvas id='canvas' />
          </div>
        </Col>
        <Col span={6} height="100%">
          <div className='tree-container' style={{height: '100%'}}>
            <Tree
              showLine={true}
              showIcon={false}
              defaultExpandAll={true}
              defaultExpandedKeys={['1']}
              onSelect={onSelect}
              treeData={treeData}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default FabricEditor;
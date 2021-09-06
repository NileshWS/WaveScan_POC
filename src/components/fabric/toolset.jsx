import React from 'react';
import { Button } from 'antd';
import { 
  AreaChartOutlined, 
  DeleteOutlined, 
  ClearOutlined, 
  SaveOutlined, 
  FileAddOutlined, 
  FileExcelOutlined, 
} from '@ant-design/icons';
import './fabric-editor.scss';

const ToolSet = ({canvas, loadImage, addFinalRect, addNextRect, deleteObject, clearAll}) => {

  const SIZE = 'medium';
  const SHAPE = 'round';

  return (
    <div className='fabric-toolset'>
      <Button type="primary" shape={SHAPE} icon={<AreaChartOutlined />} size={SIZE} 
        onClick={loadImage}>
        Add Image
      </Button>

      <Button type="primary" shape={SHAPE} icon={<FileAddOutlined /> } size={SIZE} 
        onClick={addFinalRect}>
        Red Rectangle
      </Button>

      <Button type="primary" shape={SHAPE} icon={<FileExcelOutlined />} size={SIZE} 
        onClick={addNextRect}>
        Blue Rectangle
      </Button>

      <Button type="primary" shape={SHAPE} icon={<SaveOutlined />} size={SIZE} 
        onClick={() => console.log(canvas.toJSON())}>
        Save
      </Button>

      <Button type="primary" danger shape={SHAPE} icon={<DeleteOutlined />} size={SIZE} 
        onClick={deleteObject}>
        Delete
      </Button>

      <Button type="primary" danger shape={SHAPE} icon={<ClearOutlined />} size={SIZE} 
        onClick={clearAll}>
        Clear All
      </Button>
    </div>
  );
};

export default ToolSet;
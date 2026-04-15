import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Transformer } from 'react-konva';
import { MousePointer2, Pen, Square, Circle as CircleIcon, MoveUpRight, Type, Eraser, Trash2, Undo, Palette } from 'lucide-react';

export type ToolType = 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser';

interface ShapeData {
  id: string;
  type: ToolType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: number[];
  color: string;
  strokeWidth: number;
  text?: string;
}

interface WhiteboardOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export default function WhiteboardOverlay({ isActive, onClose }: WhiteboardOverlayProps) {
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#ef4444'); // Default red
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [history, setHistory] = useState<ShapeData[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  if (!isActive) return null;

  const handleMouseDown = (e: any) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const id = Date.now().toString();

    const newShape: ShapeData = {
      id,
      type: tool,
      color: tool === 'eraser' ? '#ffffff' : color,
      strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
    };

    if (tool === 'pen' || tool === 'eraser') {
      newShape.points = [pos.x, pos.y];
    } else if (tool === 'rect' || tool === 'circle') {
      newShape.x = pos.x;
      newShape.y = pos.y;
      newShape.width = 0;
      newShape.height = 0;
    } else if (tool === 'arrow') {
      newShape.points = [pos.x, pos.y, pos.x, pos.y];
    } else if (tool === 'text') {
      const text = window.prompt('请输入文字:');
      if (text) {
        newShape.x = pos.x;
        newShape.y = pos.y;
        newShape.text = text;
        setShapes([...shapes, newShape]);
        setHistory([...history, shapes]);
      }
      setIsDrawing(false);
      return;
    }

    setShapes([...shapes, newShape]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool === 'select' || tool === 'text') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastShape = { ...shapes[shapes.length - 1] };

    if (tool === 'pen' || tool === 'eraser') {
      lastShape.points = lastShape.points?.concat([point.x, point.y]);
    } else if (tool === 'rect' || tool === 'circle') {
      lastShape.width = point.x - (lastShape.x || 0);
      lastShape.height = point.y - (lastShape.y || 0);
    } else if (tool === 'arrow') {
      lastShape.points = [lastShape.points![0], lastShape.points![1], point.x, point.y];
    }

    const newShapes = shapes.slice(0, shapes.length - 1);
    newShapes.push(lastShape);
    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHistory([...history, shapes]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setShapes(previous);
    setHistory(history.slice(0, history.length - 1));
  };

  const clearAll = () => {
    setHistory([...history, shapes]);
    setShapes([]);
    setSelectedId(null);
  };

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#000000', '#ffffff'];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Canvas Layer */}
      <div className="absolute inset-0 pointer-events-auto cursor-crosshair">
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {shapes.map((shape) => {
              const isSelected = shape.id === selectedId;
              const commonProps = {
                id: shape.id,
                stroke: shape.color,
                strokeWidth: shape.strokeWidth,
                draggable: tool === 'select',
                onClick: () => tool === 'select' && setSelectedId(shape.id),
                onTap: () => tool === 'select' && setSelectedId(shape.id),
              };

              if (shape.type === 'pen' || shape.type === 'eraser') {
                return (
                  <Line
                    key={shape.id}
                    {...commonProps}
                    points={shape.points}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={shape.type === 'eraser' ? 'destination-out' : 'source-over'}
                  />
                );
              } else if (shape.type === 'rect') {
                return (
                  <Rect
                    key={shape.id}
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                  />
                );
              } else if (shape.type === 'circle') {
                return (
                  <Circle
                    key={shape.id}
                    {...commonProps}
                    x={(shape.x || 0) + (shape.width || 0) / 2}
                    y={(shape.y || 0) + (shape.height || 0) / 2}
                    radius={Math.abs(Math.max(shape.width || 0, shape.height || 0)) / 2}
                  />
                );
              } else if (shape.type === 'arrow') {
                return (
                  <Arrow
                    key={shape.id}
                    {...commonProps}
                    points={shape.points}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                );
              } else if (shape.type === 'text') {
                return (
                  <Text
                    key={shape.id}
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    text={shape.text}
                    fontSize={shape.strokeWidth * 6}
                    fill={shape.color}
                    strokeEnabled={false}
                  />
                );
              }
              return null;
            })}
            {tool === 'select' && (
              <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => newBox} />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <ToolButton icon={<MousePointer2 />} label="选择" active={tool === 'select'} onClick={() => setTool('select')} />
          <ToolButton icon={<Pen />} label="画笔" active={tool === 'pen'} onClick={() => setTool('pen')} />
          <ToolButton icon={<Square />} label="矩形" active={tool === 'rect'} onClick={() => setTool('rect')} />
          <ToolButton icon={<CircleIcon />} label="圆圈" active={tool === 'circle'} onClick={() => setTool('circle')} />
          <ToolButton icon={<MoveUpRight />} label="箭头" active={tool === 'arrow'} onClick={() => setTool('arrow')} />
          <ToolButton icon={<Type />} label="文字" active={tool === 'text'} onClick={() => setTool('text')} />
          <ToolButton icon={<Eraser />} label="橡皮擦" active={tool === 'eraser'} onClick={() => setTool('eraser')} />
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-slate-400 shadow-sm' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : 'none' }}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={history.length === 0} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors" title="撤销">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={clearAll} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="清空">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        <button onClick={onClose} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
          退出白板
        </button>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
      title={label}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    </button>
  );
}

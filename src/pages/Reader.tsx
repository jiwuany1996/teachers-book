import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Maximize, Minimize, Video, Image as ImageIcon, 
  MessageCircle, FileText, MonitorPlay, Download, Plus, Minus, Check,
  BookOpen, Share2, Headphones, PanelRightClose, PanelRightOpen, X, Play, Settings2, Sparkles, ChevronLeft, ChevronRight, Loader2, Square, Link as LinkIcon, Unlink, Info, PenTool, Trash2
} from 'lucide-react';
import { mockResources, textbooks } from '../data/mockData';
import WhiteboardOverlay from '../components/WhiteboardOverlay';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  children, 
  onSelectArea,
  isNotesMode,
  onAddAnnotation
}: { 
  src: string, 
  alt: string, 
  className: string, 
  children?: React.ReactNode, 
  onSelectArea?: (area: any) => void,
  isNotesMode?: boolean,
  onAddAnnotation?: (area: any) => void
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.resource-marker') || (e.target as HTMLElement).closest('.guidance-anchor')) return;
    
    if (pendingSelection) {
      setPendingSelection(null);
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDragging(true);
    startPosRef.current = { x, y };
    
    if (selectionRef.current) {
      selectionRef.current.style.display = 'block';
      selectionRef.current.style.left = `${x}%`;
      selectionRef.current.style.top = `${y}%`;
      selectionRef.current.style.width = '0%';
      selectionRef.current.style.height = '0%';
      selectionRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectionRef.current) return;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      
      const x = Math.min(startPosRef.current.x, currentX);
      const y = Math.min(startPosRef.current.y, currentY);
      const width = Math.abs(currentX - startPosRef.current.x);
      const height = Math.abs(currentY - startPosRef.current.y);
      
      if (selectionRef.current) {
        selectionRef.current.style.left = `${x}%`;
        selectionRef.current.style.top = `${y}%`;
        selectionRef.current.style.width = `${width}%`;
        selectionRef.current.style.height = `${height}%`;
      }
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    const x = Math.min(startPosRef.current.x, currentX);
    const y = Math.min(startPosRef.current.y, currentY);
    const width = Math.abs(currentX - startPosRef.current.x);
    const height = Math.abs(currentY - startPosRef.current.y);
    
    if (width > 2 && height > 2) {
      setPendingSelection({ 
        src, 
        x, 
        y, 
        width, 
        height,
        containerAspect: rect.width / rect.height
      });
    } else if (selectionRef.current) {
      selectionRef.current.style.display = 'none';
    }
  };

  const confirmSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingSelection && onSelectArea) {
      onSelectArea(pendingSelection);
      setPendingSelection(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex items-center justify-center overflow-visible select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-fill pointer-events-none"
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
      />
      <div 
        ref={selectionRef}
        className={`absolute border-2 border-orange-500 bg-orange-500/10 pointer-events-none z-50 ${pendingSelection ? 'ring-4 ring-orange-500/20 transition-all duration-200' : ''}`}
        style={{
          display: isDragging || pendingSelection ? 'block' : 'none',
          left: pendingSelection ? `${pendingSelection.x}%` : '0',
          top: pendingSelection ? `${pendingSelection.y}%` : '0',
          width: pendingSelection ? `${pendingSelection.width}%` : '0',
          height: pendingSelection ? `${pendingSelection.height}%` : '0',
        }}
      >
        {pendingSelection && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              // If selection is near the bottom, move buttons to the top of the selection
              bottom: pendingSelection.y + pendingSelection.height > 85 ? 'auto' : '-48px',
              top: pendingSelection.y + pendingSelection.height > 85 ? '-48px' : 'auto',
            }}
          >
            {onSelectArea && (
              <button 
                onClick={confirmSelection}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <MonitorPlay className="w-4 h-4" />
                确认聚焦
              </button>
            )}
            {isNotesMode && onAddAnnotation && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onAddAnnotation(pendingSelection); 
                  setPendingSelection(null); 
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <PenTool className="w-4 h-4" />
                添加批注
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setPendingSelection(null); }}
              className="bg-white hover:bg-slate-100 text-slate-600 p-1.5 rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

const LegendItem = ({ type, label, subLabel, iconSrc, subCategories }: { type: string, label: string, subLabel: string, iconSrc: string, subCategories?: { id: string, name: string }[] }) => (
  <div className="group relative flex flex-col gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-default">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg shadow-md flex items-center justify-center overflow-hidden shrink-0">
        <img src={iconSrc} alt={type} className="w-full h-full object-cover" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800">{type}（{label}）</div>
        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subLabel}</div>
      </div>
    </div>
    {subCategories && subCategories.length > 0 && (
      <div className="absolute right-full top-0 mr-2 w-48 bg-white border border-slate-200 shadow-xl rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="flex flex-col gap-2">
          {subCategories.map(sub => (
            <div key={sub.id} className="text-xs text-slate-600 flex items-center gap-2 hover:text-orange-600 transition-colors">
              <span className="font-bold text-orange-500 w-8">{sub.id}</span>
              <span>{sub.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const PageResourceMarkers = ({ 
  resources, 
  onMarkerClick, 
  isTooltipAlwaysOn,
  sizeClass = 'w-10 h-10'
}: { 
  resources: {id: string, top: string}[], 
  onMarkerClick: (id: string) => void, 
  isTooltipAlwaysOn: boolean,
  sizeClass?: string
}) => {
  if (!resources || resources.length === 0) return null;

  const isSmall = sizeClass.includes('w-6') || sizeClass.includes('w-7') || sizeClass.includes('w-8');

  return (
    <div className="absolute right-2 top-0 bottom-0 w-12 z-30 pointer-events-none">
      {resources.map(resObj => {
        const resId = resObj.id;
        const res = mockResources[resId];
        if (!res) return null;
        
        let iconSrc = '';
        let iconText = 'R';
        let typeName = '';
        
        // Map subType to full name based on legend
        const subTypeMap: Record<string, string> = {
          'V-1': '情景导入类', 'V-2': '原理动画类', 'V-3': '实录微课类', 'V-4': 'AIGC讲解类',
          'A-1': '启发式提问', 'A-2': '互动式问答', 'A-3': '探究式问题', 'A-4': 'AI问答',
          'P-1': '思维导图类', 'P-2': '结构图谱类', 'P-3': '实物图解类', 'P-4': '表单模板类',
          'I-1': '测评练习类', 'I-2': '工具仿真类', 'I-3': '虚拟操作类', 'i-1': '测评练习类', 'i-2': '工具仿真类', 'i-3': '虚拟操作类',
          'D-1': '电子手册类', 'D-2': '行业案例库类', 'D-3': '资讯报告类'
        };

        if (res.type === 'V') { iconSrc = '/assets/V类资源图标.png'; iconText = 'V'; }
        else if (res.type === 'A') { iconSrc = '/assets/A类资源图标.png'; iconText = 'A'; }
        else if (res.type === 'P') { iconSrc = '/assets/P类资源图标.png'; iconText = 'P'; }
        else if (res.type === 'i') { iconSrc = '/assets/i类资源图标.png'; iconText = 'i'; }
        else if (res.type === 'D') { iconSrc = '/assets/D类资源图标.png'; iconText = 'D'; }

        typeName = res.subType ? (subTypeMap[res.subType] || res.type) : res.type;

        return (
          <div key={resId} className="absolute right-0 group flex items-center pointer-events-auto" style={{ top: resObj.top }}>
            {/* Tooltip bubble */}
            <div className={`absolute right-full mr-2 transition-opacity pointer-events-none flex items-center z-50 ${isTooltipAlwaysOn ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
              <div className={`bg-[#333b4d] text-white py-1.5 px-3 rounded shadow-lg whitespace-nowrap flex items-center gap-2 ${isSmall ? 'text-[10px]' : 'text-sm'}`}>
                <span>【{res.subType || iconText}】{typeName} {res.title}</span>
              </div>
              <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-[#333b4d]"></div>
            </div>
            
            {/* Marker Icon */}
            <button 
              onClick={() => onMarkerClick(resId)}
              className={`${sizeClass} rounded-md shadow-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden`}
            >
              {iconSrc ? (
                <img src={iconSrc} alt={iconText} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-slate-500 text-white font-bold flex items-center justify-center ${isSmall ? 'text-[10px]' : 'text-xs'}`}>{iconText}</div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const ResourceMarker = ({ 
  resourceId, 
  onClick, 
  isActive 
}: { 
  resourceId: string; 
  onClick: (id: string) => void;
  isActive: boolean;
}) => {
  const resource = mockResources[resourceId];
  if (!resource) return null;

  const getIcon = () => {
    switch (resource.type) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'image': return <ImageIcon className="w-3 h-3" />;
      case 'qa': return <MessageCircle className="w-3 h-3" />;
      case 'doc': return <FileText className="w-3 h-3" />;
      case 'interactive': return <MonitorPlay className="w-3 h-3" />;
      case 'ppt': return <MonitorPlay className="w-3 h-3" />;
      case 'audio': return <Headphones className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getColor = () => {
    switch (resource.type) {
      case 'video': return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200';
      case 'image': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'qa': return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
      case 'doc': return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
      case 'interactive': return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200';
      case 'ppt': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'audio': return 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  return (
    <span 
      onClick={(e) => { e.stopPropagation(); onClick(resourceId); }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border cursor-pointer transition-all ml-2 align-middle shadow-sm ${getColor()} ${isActive ? 'ring-2 ring-offset-1 ring-orange-500 scale-105' : ''}`}
      title="点击查看资源详情"
    >
      {getIcon()}
      {resource.title}
    </span>
  );
};

interface Annotation {
  id: string;
  bookId: string;
  type: 'student' | 'teacher';
  pageNumber: number;
  area: { x: number, y: number, width: number, height: number };
  content: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

const AnnotationSidebarItem = ({ 
  annotation, 
  isActive,
  onClick,
  onUpdate, 
  onDelete, 
  onClose,
  onPreviewImage
}: { 
  annotation: Annotation, 
  isActive: boolean,
  onClick: () => void,
  onUpdate: (ann: Annotation) => void, 
  onDelete: (id: string) => void, 
  onClose: () => void,
  onPreviewImage: (url: string) => void
}) => {
  const [content, setContent] = useState(annotation.content);
  const [imageUrl, setImageUrl] = useState(annotation.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      setContent(annotation.content);
      setImageUrl(annotation.imageUrl || '');
    }
  }, [isActive, annotation]);

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!content.trim() && !imageUrl.trim()) {
      onDelete(annotation.id);
      return;
    }
    onUpdate({ ...annotation, content, imageUrl, updatedAt: Date.now() });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const isStudent = annotation.type === 'student';
  const themeColor = isStudent ? 'orange' : 'blue';
  const borderColor = isActive ? `border-${themeColor}-500 ring-1 ring-${themeColor}-500` : `border-slate-200 hover:border-${themeColor}-300`;
  const badgeBg = isStudent ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600';

  return (
    <div 
      onClick={onClick}
      className={`p-3 bg-white border rounded-lg shadow-sm text-sm cursor-pointer transition-colors ${borderColor}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeBg}`}>
            {isStudent ? '教材' : '教参'} P{annotation.pageNumber + 1}
          </div>
          <span className="text-xs text-slate-500">{new Date(annotation.updatedAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          {isActive && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 text-slate-400 hover:text-slate-600 rounded" title="收起">
              <X className="w-3 h-3" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(annotation.id); }} className="p-1 text-slate-400 hover:text-red-600 rounded" title="删除批注">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isActive ? (
        <div className="flex flex-col gap-3 mt-2" onClick={e => e.stopPropagation()}>
          <textarea
            autoFocus
            value={content}
            onChange={e => setContent(e.target.value)}
            onPaste={handlePaste}
            placeholder="添加批注内容... (支持粘贴图片)"
            className={`w-full h-24 p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
          />
          
          {imageUrl ? (
            <div className="relative group">
              <img 
                src={imageUrl} 
                alt="批注图片" 
                className="w-full rounded-lg border border-slate-200 max-h-40 object-contain bg-slate-50 cursor-zoom-in" 
                onClick={() => onPreviewImage(imageUrl)}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs text-${themeColor}-500 hover:text-${themeColor}-600 flex items-center gap-1`}
              >
                <ImageIcon className="w-3 h-3" /> 添加本地图片
              </button>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={(e) => {
              e.stopPropagation();
              if (!annotation.content && !annotation.imageUrl) {
                onDelete(annotation.id);
              } else {
                setContent(annotation.content);
                setImageUrl(annotation.imageUrl || '');
                onClose();
              }
            }} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">
              取消
            </button>
            <button onClick={handleSave} className={`px-3 py-1.5 text-xs bg-${themeColor}-500 text-white hover:bg-${themeColor}-600 rounded-lg font-medium`}>
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          {annotation.content && <p className="text-slate-700 whitespace-pre-wrap line-clamp-2 text-xs">{annotation.content}</p>}
          {annotation.imageUrl && (
            <img 
              src={annotation.imageUrl} 
              alt="批注图片" 
              className="mt-2 rounded border border-slate-100 object-cover h-16 w-full cursor-zoom-in" 
              onClick={(e) => { e.stopPropagation(); onPreviewImage(annotation.imageUrl!); }}
            />
          )}
          {!annotation.content && !annotation.imageUrl && (
            <p className="text-xs text-slate-400 italic">空批注</p>
          )}
        </div>
      )}
    </div>
  );
};

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStudentPage, setCurrentStudentPage] = useState(0);
  const [currentTeacherPage, setCurrentTeacherPage] = useState(0);
  const [isPageSyncEnabled, setIsPageSyncEnabled] = useState(true);
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    const saved = localStorage.getItem('reader-annotations-v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('reader-annotations-v2', JSON.stringify(annotations));
  }, [annotations]);

  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [presentationArea, setPresentationArea] = useState<any | null>(null);
  const [presentationZoom, setPresentationZoom] = useState(1);

  useEffect(() => {
    if (!presentationArea) {
      setPresentationZoom(1);
    }
  }, [presentationArea]);
  const [previewResource, setPreviewResource] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'info'>('content');
  const [qaExpanded, setQaExpanded] = useState<Record<string, boolean>>({});

  // Mock data for Q&A resources
  const mockQAData: Record<string, { q: string, a: string }[]> = {
    'sci-res-6': [
      { q: '如何引导学生观察西瓜？', a: '可以从颜色、形状、纹理、触感、气味等多个维度引导学生进行描述。' },
      { q: '学生如果说西瓜是红色的怎么办？', a: '引导学生区分“外皮”和“果肉”，强调观察要全面。' }
    ],
    'sci-res-15': [
      { q: '保护眼睛有哪些具体做法？', a: '不在强光下看书，保持正确坐姿，定期做眼保健操等。' },
      { q: '如何向一年级学生解释感官的重要性？', a: '通过“盲人摸象”或“猜猜我是谁”的小游戏，让学生体会失去某种感官后的不便。' }
    ],
    'sci-res-19': [
      { q: '探究环节一的重点是什么？', a: '激发学生的好奇心，鼓励他们提出问题。' },
      { q: '时间分配建议？', a: '建议控制在5-8分钟，避免过度发散。' }
    ]
  };

  const toggleQa = (id: string) => {
    setQaExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [cart, setCart] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'dual' | 'student' | 'teacher'>('dual');
  const [pageLayout, setPageLayout] = useState<'single' | 'double'>('single');
  const [showLegend, setShowLegend] = useState(false);
  const [isTooltipAlwaysOn, setIsTooltipAlwaysOn] = useState(true);
  const [hoveredGuidanceId, setHoveredGuidanceId] = useState<string | null>(null);
  
  // z-index management for panels
  const [zIndices, setZIndices] = useState({
    legend: 50,
    preview: 51,
    prep: 52,
    header: 10
  });

  const bringToFront = (panel: keyof typeof zIndices) => {
    setZIndices(prev => {
      const maxZ = Math.max(...(Object.values(prev) as number[]));
      const newZ = maxZ + 1;
      if (panel === 'legend') {
        return { ...prev, legend: newZ, header: newZ };
      }
      return { ...prev, [panel]: newZ };
    });
  };

  // Prep Config Modal State
  const [showPrepConfig, setShowPrepConfig] = useState(false);

  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [guidanceLines, setGuidanceLines] = useState<{teacher: any[], student: any[]}>({teacher: [], student: []});

  const updateGuidanceLines = useCallback(() => {
    if (!isGuidanceMode) {
      setGuidanceLines({teacher: [], student: []});
      return;
    }
    
    const newLines = {teacher: [] as any[], student: [] as any[]};
    
    const processLines = (type: 'teacher' | 'student', currentPage: number) => {
      const containerEl = document.getElementById(`book-container-${type}`);
      if (!containerEl) return;
      const containerRect = containerEl.getBoundingClientRect();
      
      const currentGuidanceLeft = type === 'student' ? studentGuidanceData[currentPage] : teacherGuidanceData[currentPage];
      const currentGuidanceRight = pageLayout === 'double' ? (type === 'student' ? studentGuidanceData[currentPage + 1] : teacherGuidanceData[currentPage + 1]) : [];
      
    const allGuidance = [...(currentGuidanceLeft || []).map(g => ({...g, pageOffset: 0})), ...(currentGuidanceRight || []).map(g => ({...g, pageOffset: 1}))];
    
    allGuidance.forEach(guide => {
      const guideEl = document.getElementById(`guide-card-${guide.id}`);
      const anchorEl = document.getElementById(`anchor-${guide.id}`);
      
      if (guideEl && anchorEl) {
        const guideRect = guideEl.getBoundingClientRect();
        const anchorRect = anchorEl.getBoundingClientRect();
        
        const isDual = viewMode === 'dual';
        const isCardOnLeft = !isDual && guide.position === 'left';
        
        const x1 = isCardOnLeft ? guideRect.right - containerRect.left : guideRect.left - containerRect.left;
        const y1 = guideRect.top + guideRect.height / 2 - containerRect.top;
        
        const x2 = anchorRect.left + anchorRect.width / 2 - containerRect.left;
        const y2 = anchorRect.top + anchorRect.height / 2 - containerRect.top;
        
        newLines[type].push({ id: guide.id, x1, y1, x2, y2, isLeft: isCardOnLeft });
      }
    });
  };

    if (viewMode === 'dual' || viewMode === 'teacher') processLines('teacher', currentTeacherPage);
    if (viewMode === 'dual' || viewMode === 'student') processLines('student', currentStudentPage);
    
    setGuidanceLines(newLines);
  }, [isGuidanceMode, viewMode, currentStudentPage, currentTeacherPage, pageLayout]);

  useEffect(() => {
    updateGuidanceLines();
    window.addEventListener('resize', updateGuidanceLines);
    
    // Update after a short delay to account for image loading/resizing animations
    const timer1 = setTimeout(updateGuidanceLines, 100);
    const timer2 = setTimeout(updateGuidanceLines, 500);
    
    return () => {
      window.removeEventListener('resize', updateGuidanceLines);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [updateGuidanceLines]);

  const getStudentPageForTeacherPage = (teacherPage: number) => {
    if (teacherPage >= 0 && teacherPage <= 1) return 0; // 封面, 副封面 -> 封面
    if (teacherPage >= 2 && teacherPage <= 8) return 1; // 走进科学1-7 -> 第1页
    if (teacherPage >= 9) return 2; // 从观察开始 -> 第2页
    return 0;
  };

  const getTeacherPageForStudentPage = (studentPage: number) => {
    if (studentPage === 0) return 0; // 封面 -> 1.教师用书封面
    if (studentPage === 1) return 2; // 第1页 -> 走进科学1
    if (studentPage >= 2) return 9; // 第2页 -> 从观察开始1
    return 0;
  };

  const handleTeacherPageChange = (newPage: number) => {
    setCurrentTeacherPage(newPage);
    if (isPageSyncEnabled) {
      setCurrentStudentPage(getStudentPageForTeacherPage(newPage));
    }
  };

  const handleStudentPageChange = (newPage: number) => {
    setCurrentStudentPage(newPage);
    if (isPageSyncEnabled) {
      setCurrentTeacherPage(getTeacherPageForStudentPage(newPage));
    }
  };
  const [prepComplexity, setPrepComplexity] = useState('标准');
  const [prepObjective, setPrepObjective] = useState('新授课');
  const [prepStudentProfile, setPrepStudentProfile] = useState('常规班级');
  const [prepTeachingStyle, setPrepTeachingStyle] = useState('游戏互动为主');
  const [prepCustomReq, setPrepCustomReq] = useState('');

  const currentBook = textbooks.find(b => b.id === id);

  // Mock page resources mapping
  type PageResource = { id: string, top: string };

  const teacherPageResources: Record<number, PageResource[]> = {
    0: [], 1: [],
    2: [{ id: 'sci-res-4', top: '15%' }, { id: 'sci-res-17', top: '45%' }], // 目录/导读
    3: [{ id: 'sci-res-6', top: '25%' }, { id: 'sci-res-7', top: '65%' }], // 走进科学
    4: [{ id: 'sci-res-10', top: '20%' }], // 科学家的故事
    5: [{ id: 'sci-res-16', top: '35%' }, { id: 'sci-res-12', top: '75%' }], // 从观察开始
    6: [{ id: 'sci-res-15', top: '30%' }], // 保护感官
    7: [], 8: [],
  };

  const studentPageResources: Record<number, PageResource[]> = {
    0: [], 1: [],
    2: [{ id: 'sci-res-1', top: '20%' }, { id: 'sci-res-2', top: '55%' }], // 目录/导读
    3: [{ id: 'sci-res-5', top: '30%' }, { id: 'sci-res-8', top: '70%' }], // 走进科学
    4: [{ id: 'sci-res-9', top: '40%' }], // 科学家的故事
    5: [{ id: 'sci-res-11', top: '25%' }, { id: 'sci-res-13', top: '65%' }], // 从观察开始
    6: [{ id: 'sci-res-14', top: '35%' }, { id: 'sci-res-18', top: '75%' }], // 保护感官
    7: [], 8: [],
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Ensure fullscreen is exited when component unmounts and listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  const handleMarkerClick = (resId: string) => {
    setPreviewResource(mockResources[resId]);
    bringToFront('preview');
  };

  const toggleCart = (resId: string) => {
    setCart(prev => prev.includes(resId) ? prev.filter(i => i !== resId) : [...prev, resId]);
  };

  const handleGeneratePrep = () => {
    setShowPrepConfig(true);
    bringToFront('prep');
  };

  const confirmGeneratePrep = () => {
    setShowPrepConfig(false);
    navigate('/prep', { 
      state: { 
        bookId: id, 
        resources: cart,
        prepConfig: {
          complexity: prepComplexity,
          objective: prepObjective,
          studentProfile: prepStudentProfile,
          teachingStyle: prepTeachingStyle,
          customReq: prepCustomReq,
          chapter: currentBook?.title || '未知章节'
        }
      } 
    });
  };

  const handleAddAnnotation = (type: 'student' | 'teacher', pageNumber: number, area: any) => {
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      bookId: id || '',
      type,
      pageNumber,
      area: { x: area.x, y: area.y, width: area.width, height: area.height },
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotationId(newAnnotation.id);
    setIsNotesMode(true);
  };

  const handleExportAnnotations = () => {
    const bookNotes = annotations.filter(n => n.bookId === id);
    if (bookNotes.length === 0) {
      alert('当前没有可导出的批注内容');
      return;
    }
    
    bookNotes.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.pageNumber - b.pageNumber;
    });

    let exportText = `《${currentBook?.title || '未知书籍'}》教学随笔与批注\n`;
    exportText += `导出时间: ${new Date().toLocaleString()}\n\n`;
    exportText += `=========================================\n\n`;

    bookNotes.forEach(note => {
      const typeName = note.type === 'student' ? '教材' : '教参';
      exportText += `【${typeName} - 第${note.pageNumber + 1}页】\n`;
      exportText += `更新时间: ${new Date(note.updatedAt).toLocaleString()}\n`;
      exportText += `-----------------------------------------\n`;
      if (note.content) exportText += `${note.content}\n`;
      if (note.imageUrl) exportText += `[附图: ${note.imageUrl}]\n`;
      exportText += `\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook?.title || '教学'}_批注.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  type GuidanceItem = {
    id: string;
    title: string;
    content: string;
    position: 'left' | 'right';
    anchor: { top: string, left: string };
    pageOffset?: 0 | 1;
    resourceId?: string;
  };

  const teacherGuidanceData: Record<number, GuidanceItem[]> = {
    2: [
      { id: 'tg-2-1', title: '单元导读', content: '本单元是科学学习的开端，旨在引导学生走进科学世界，激发对科学的兴趣。', position: 'left', anchor: { top: '20%', left: '30%' }, pageOffset: 0 }
    ],
    3: [
      { id: 'tg-3-1', title: '教学目标', content: '认识眼、耳、鼻、舌、手五种感官，并能用它们进行观察。', position: 'left', anchor: { top: '25%', left: '60%' }, pageOffset: 0 }
    ],
    4: [
      { id: 'tg-4-1', title: '拓展交流', content: '鼓励学生分享在生活中使用感官发现的有趣事物。', position: 'left', anchor: { top: '35%', left: '65%' }, pageOffset: 0 }
    ],
    5: [
      { id: 'tg-5-1', title: '活动组织', content: '分组进行观察活动，确保每个学生都有动手操作的机会。', position: 'left', anchor: { top: '50%', left: '40%' }, pageOffset: 0 }
    ],
    6: [
      { id: 'tg-6-1', title: '重点难点', content: '重点：掌握五种感官的正确使用方法。难点：能用准确的词汇描述观察到的现象。', position: 'left', anchor: { top: '40%', left: '50%' }, pageOffset: 0 }
    ]
  };

  const studentGuidanceData: Record<number, GuidanceItem[]> = {
    2: [
      { id: 'sg-2-1', title: '情景引入', content: '利用插图中的宇宙、地球、自然风光等元素，激发学生的好奇心。', position: 'right', anchor: { top: '40%', left: '50%' }, resourceId: 'sci-res-1', pageOffset: 0 }
    ],
    3: [
      { id: 'sg-3-1', title: '活动指导', content: '引导学生运用多种感官观察西瓜。看颜色、形状；摸表皮；闻气味；尝味道；听敲击的声音。', position: 'right', anchor: { top: '45%', left: '75%' }, resourceId: 'sci-res-2', pageOffset: 0 }
    ],
    4: [
      { id: 'sg-4-1', title: '安全提示', content: '提醒学生在观察未知事物时，不要随便闻或尝，注意安全。', position: 'right', anchor: { top: '60%', left: '40%' }, pageOffset: 0 }
    ],
    5: [
      { id: 'sg-5-1', title: '观察记录', content: '指导学生将观察到的现象记录在活动手册上。', position: 'right', anchor: { top: '70%', left: '60%' }, pageOffset: 0 }
    ],
    6: [
      { id: 'sg-6-1', title: '保护感官', content: '结合插图，讲解在不同场景下如何保护我们的感官。', position: 'right', anchor: { top: '30%', left: '50%' }, pageOffset: 0 }
    ]
  };

  const studentPages = [
    "/assets/科学一年级上册教材封面.png",
    "/assets/科学教材第1页.png",
    "/assets/科学教材第2页.png",
    "/assets/科学教材第3页.png",
    "/assets/科学教材第4页.png",
    "/assets/科学教材第5页.png",
    "/assets/科学教材第6页.png",
  ];

  const teacherPages = [
    "/assets/1.教师用书封面.jpg",
    "/assets/2.教师用书副封面.jpg",
    "/assets/走进科学1.png",
    "/assets/走进科学2.png",
    "/assets/走进科学3.png",
    "/assets/走进科学4.png",
    "/assets/走进科学5.png",
    "/assets/走进科学6.png",
    "/assets/走进科学7.png",
    "/assets/从观察开始1.png",
    "/assets/从观察开始2.png",
    "/assets/从观察开始3.png",
    "/assets/从观察开始4.png",
    "/assets/从观察开始5.png",
    "/assets/从观察开始6.png",
    "/assets/从观察开始7.png",
    "/assets/从观察开始8.png",
    "/assets/从观察开始9.png",
    "/assets/从观察开始10.png",
    "/assets/从观察开始11.png",
    "/assets/从观察开始12.png",
    "/assets/从观察开始13.png",
    "/assets/从观察开始14.png",
    "/assets/从观察开始15.png",
    "/assets/从观察开始16.png",
    "/assets/从观察开始17.png",
    "/assets/从观察开始18.png",
    "/assets/从观察开始19.png",
  ];

  // Preload images to optimize loading speed
  useEffect(() => {
    const preloadImages = (urls: string[]) => {
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    preloadImages(studentPages);
    preloadImages(teacherPages);
  }, []);

  const renderBookView = (pages: string[], type: 'student' | 'teacher', currentPage: number, onPageChange: (newPage: number) => void) => {
    const isStudent = type === 'student';
    const isDual = viewMode === 'dual';
    const isDouble = pageLayout === 'double';
    const isSidebarOpen = (isGuidanceMode && isDual) || isNotesMode;
    const isDualDouble = isDouble && isDual;
    const imageSizingClass = isDualDouble ? 'w-full h-auto' : 'h-full w-auto';
    
    const step = isDouble ? 2 : 1;
    const maxPage = Math.max(0, pages.length - (isDouble ? 2 : 1));

    const resources = type === 'teacher' ? teacherPageResources : studentPageResources;

    const currentGuidanceLeft = isGuidanceMode ? (isStudent ? studentGuidanceData[currentPage] : teacherGuidanceData[currentPage]) || [] : [];
    const currentGuidanceRight = (isGuidanceMode && isDouble) ? (isStudent ? studentGuidanceData[currentPage + 1] : teacherGuidanceData[currentPage + 1]) || [] : [];
    const allGuidance = [...currentGuidanceLeft.map(g => ({...g, pageOffset: 0})), ...currentGuidanceRight.map(g => ({...g, pageOffset: 1}))];

    let floatingGuidance: GuidanceItem[] = [];
    if (!isDual && isGuidanceMode) {
      if (isStudent) {
        const sgLeft = studentGuidanceData[currentPage] || [];
        const sgRight = isDouble ? (studentGuidanceData[currentPage + 1] || []) : [];
        floatingGuidance = [
          ...sgLeft.map(g => ({...g, pageOffset: 0})),
          ...sgRight.map(g => ({...g, pageOffset: 1}))
        ];
      } else {
        const tgLeft = teacherGuidanceData[currentPage] || [];
        const tgRight = isDouble ? (teacherGuidanceData[currentPage + 1] || []) : [];
        floatingGuidance = [
          ...tgLeft.map(g => ({...g, pageOffset: 0})),
          ...tgRight.map(g => ({...g, pageOffset: 1}))
        ];
      }
    }

    const leftGuidance = floatingGuidance.filter(g => g.position === 'left');
    const rightGuidance = floatingGuidance.filter(g => g.position === 'right');
    const hasLeftGuidance = !isDual && isGuidanceMode && leftGuidance.length > 0;
    const hasRightGuidance = !isDual && isGuidanceMode && rightGuidance.length > 0;
    const showEmptyGuidance = !isDual && isGuidanceMode && floatingGuidance.length === 0;

    // Calculate padding based on mode
    let containerPadding = 'px-16 py-0';
    if (isSidebarOpen) {
      containerPadding = 'px-8 py-4'; // Reduced from px-12 py-8
    } else if (isDualDouble) {
      containerPadding = 'px-4 py-2'; // Significant reduction for dual-double
    }

    if (!isDual && isGuidanceMode) {
      containerPadding = `${hasLeftGuidance ? 'pl-[18rem]' : 'pl-16'} ${hasRightGuidance || showEmptyGuidance ? 'pr-[18rem]' : 'pr-16'} py-4`;
    }

    // Calculate marker size based on available space
    let markerSizeClass = 'w-10 h-10';
    if (isDual) {
      if (isDouble) {
        markerSizeClass = isSidebarOpen ? 'w-6 h-6' : 'w-7 h-7';
      } else {
        // Dual screen, single page
        markerSizeClass = isSidebarOpen ? 'w-8 h-8' : 'w-10 h-10';
      }
    } else {
      // Single screen (Teacher or Student mode)
      if (isDouble) {
        markerSizeClass = isSidebarOpen ? 'w-8 h-8' : 'w-10 h-10';
      } else {
        markerSizeClass = isSidebarOpen ? 'w-9 h-9' : 'w-10 h-10';
      }
    }

    return (
      <div id={`book-container-${type}`} className={`relative flex-1 min-h-0 w-full transition-all duration-500 ease-in-out flex ${isDouble ? 'gap-0' : 'gap-2'} justify-center items-center`}>
        
        {/* Navigation Left */}
        <button 
          onClick={() => onPageChange(Math.max(0, currentPage - step))}
          disabled={currentPage === 0}
          className={`absolute left-0 z-30 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Book Container */}
        <div className={`relative h-full w-full flex transition-all duration-500 ${containerPadding} origin-center`}>
          {/* Left Page (or Single Page) */}
          <div className={`relative h-full flex-1 flex ${isDouble ? (isDualDouble ? 'items-center justify-end pl-10' : 'items-center justify-end pl-12') : 'justify-center px-12'}`}>
            {pages[currentPage] ? (
              <div className="relative h-full flex items-center justify-center">
                {/* Floating Guidance Cards (Left) */}
                {hasLeftGuidance && (
                  <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 w-64 pointer-events-none">
                    {leftGuidance.map(guide => (
                      <div key={guide.id} id={`guide-card-${guide.id}`} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-100 overflow-hidden relative pointer-events-auto transition-all hover:shadow-2xl hover:scale-[1.02]">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                        <div className="p-4 pl-5">
                          <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            {guide.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{guide.content}</p>
                          {guide.resourceId && (
                            <div className="mt-3 pt-2 border-t border-emerald-100/50">
                              <ResourceMarker resourceId={guide.resourceId} onClick={handleMarkerClick} isActive={previewResource?.id === guide.resourceId} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <ImageWithFallback 
                  src={pages[currentPage]} 
                  alt={`${type === 'student' ? '学生' : '教师'}教材第${currentPage + 1}页`} 
                  className={`${imageSizingClass} aspect-[3/4] shadow-2xl ${pageLayout === 'double' ? 'rounded-l-sm' : ''} bg-white relative z-10`} 
                  onSelectArea={setPresentationArea}
                  isNotesMode={isNotesMode}
                  onAddAnnotation={(area) => handleAddAnnotation(type, currentPage, area)}
                >
                  <PageResourceMarkers 
                    resources={resources[currentPage] || []} 
                    onMarkerClick={handleMarkerClick} 
                    isTooltipAlwaysOn={isTooltipAlwaysOn} 
                    sizeClass={markerSizeClass}
                  />
                  {isGuidanceMode && allGuidance.filter(g => g.pageOffset === 0).map(guide => (
                    <div 
                      key={`anchor-${guide.id}`}
                      id={`anchor-${guide.id}`}
                      className={`absolute w-5 h-5 flex items-center justify-center bg-emerald-500 rounded-full border-2 border-white shadow-lg z-20 transition-all cursor-pointer ${hoveredGuidanceId === guide.id ? 'scale-125 ring-4 ring-emerald-200' : 'hover:scale-110'}`}
                      style={{ top: guide.anchor.top, left: guide.anchor.left, transform: 'translate(-50%, -50%)' }}
                      onMouseEnter={() => setHoveredGuidanceId(guide.id)}
                      onMouseLeave={() => setHoveredGuidanceId(null)}
                      onClick={() => {
                        const el = document.getElementById(`guide-card-${guide.id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  ))}
                  {isNotesMode && annotations.filter(a => a.bookId === id && a.type === type && a.pageNumber === currentPage).map(ann => (
                      <div 
                        key={ann.id}
                        className={`absolute border-2 ${activeAnnotationId === ann.id ? 'border-blue-500 bg-blue-500/10 z-40' : 'border-blue-300 bg-blue-300/10 z-30 hover:border-blue-400 hover:bg-blue-400/10 cursor-pointer'}`}
                        style={{
                          left: `${ann.area.x}%`,
                          top: `${ann.area.y}%`,
                          width: `${ann.area.width}%`,
                          height: `${ann.area.height}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAnnotationId(ann.id);
                        }}
                      >
                        {activeAnnotationId !== ann.id && (
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-md">
                            <MessageCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                  ))}
                </ImageWithFallback>

                {/* Floating Guidance Cards (Right) - Single Page Mode */}
                {(hasRightGuidance || showEmptyGuidance) && !isDouble && (
                  <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 w-64 pointer-events-none">
                    {showEmptyGuidance ? (
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 border-dashed overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
                        <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">本页暂无教学融合指导内容</p>
                      </div>
                    ) : (
                      rightGuidance.map(guide => (
                        <div key={guide.id} id={`guide-card-${guide.id}`} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-100 overflow-hidden relative pointer-events-auto transition-all hover:shadow-2xl hover:scale-[1.02]">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                          <div className="p-4 pl-5">
                            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-emerald-500" />
                              {guide.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{guide.content}</p>
                            {guide.resourceId && (
                              <div className="mt-3 pt-2 border-t border-emerald-100/50">
                                <ResourceMarker resourceId={guide.resourceId} onClick={handleMarkerClick} isActive={previewResource?.id === guide.resourceId} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={`${imageSizingClass} aspect-[3/4] bg-white shadow-2xl ${pageLayout === 'double' ? 'rounded-l-sm' : ''} flex items-center justify-center text-slate-400 relative z-10`}>
                暂无内容
              </div>
            )}
          </div>

          {/* Right Page (if double layout) */}
          {isDouble && (
            <div className={`relative h-full flex-1 flex items-center ${isDualDouble ? 'justify-start pr-10' : 'justify-start pr-12'}`}>
              {pages[currentPage + 1] ? (
                <div className="relative h-full flex items-center justify-center">
                  <ImageWithFallback 
                    src={pages[currentPage + 1]} 
                    alt={`${type === 'student' ? '学生' : '教师'}教材第${currentPage + 2}页`} 
                    className={`${imageSizingClass} aspect-[3/4] shadow-2xl rounded-r-sm bg-white relative z-10`} 
                    onSelectArea={setPresentationArea}
                    isNotesMode={isNotesMode}
                    onAddAnnotation={(area) => handleAddAnnotation(type, currentPage + 1, area)}
                  >
                    <PageResourceMarkers 
                      resources={resources[currentPage + 1] || []} 
                      onMarkerClick={handleMarkerClick} 
                      isTooltipAlwaysOn={isTooltipAlwaysOn}
                      sizeClass={markerSizeClass}
                    />
                    {isGuidanceMode && allGuidance.filter(g => g.pageOffset === 1).map(guide => (
                      <div 
                        key={`anchor-${guide.id}`}
                        id={`anchor-${guide.id}`}
                        className={`absolute w-5 h-5 flex items-center justify-center bg-emerald-500 rounded-full border-2 border-white shadow-lg z-20 transition-all cursor-pointer ${hoveredGuidanceId === guide.id ? 'scale-125 ring-4 ring-emerald-200' : 'hover:scale-110'}`}
                        style={{ top: guide.anchor.top, left: guide.anchor.left, transform: 'translate(-50%, -50%)' }}
                        onMouseEnter={() => setHoveredGuidanceId(guide.id)}
                        onMouseLeave={() => setHoveredGuidanceId(null)}
                        onClick={() => {
                          const el = document.getElementById(`guide-card-${guide.id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    ))}
                    {isNotesMode && annotations.filter(a => a.bookId === id && a.type === type && a.pageNumber === currentPage + 1).map(ann => (
                        <div 
                          key={ann.id}
                          className={`absolute border-2 ${activeAnnotationId === ann.id ? 'border-blue-500 bg-blue-500/10 z-40' : 'border-blue-300 bg-blue-300/10 z-30 hover:border-blue-400 hover:bg-blue-400/10 cursor-pointer'}`}
                          style={{
                            left: `${ann.area.x}%`,
                            top: `${ann.area.y}%`,
                            width: `${ann.area.width}%`,
                            height: `${ann.area.height}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAnnotationId(ann.id);
                          }}
                        >
                          {activeAnnotationId !== ann.id && (
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-md">
                              <MessageCircle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                    ))}
                  </ImageWithFallback>

                  {/* Floating Guidance Cards (Right) - Double Page Mode */}
                  {(hasRightGuidance || showEmptyGuidance) && (
                    <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 w-64 pointer-events-none">
                      {showEmptyGuidance ? (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 border-dashed overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
                          <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">本页暂无教学融合指导内容</p>
                        </div>
                      ) : (
                        rightGuidance.map(guide => (
                          <div key={guide.id} id={`guide-card-${guide.id}`} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-100 overflow-hidden relative pointer-events-auto transition-all hover:shadow-2xl hover:scale-[1.02]">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                            <div className="p-4 pl-5">
                              <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                {guide.title}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">{guide.content}</p>
                              {guide.resourceId && (
                                <div className="mt-3 pt-2 border-t border-emerald-100/50">
                                  <ResourceMarker resourceId={guide.resourceId} onClick={handleMarkerClick} isActive={previewResource?.id === guide.resourceId} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`${imageSizingClass} aspect-[3/4] bg-white shadow-2xl rounded-r-sm flex items-center justify-center text-slate-400 relative z-10`}>
                  暂无内容
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guidance Lines SVG Overlay */}
        {isGuidanceMode && guidanceLines[type] && guidanceLines[type].length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {guidanceLines[type].map(line => (
              <g key={`line-group-${line.id}`} className={`transition-opacity duration-300 ${(!hoveredGuidanceId || hoveredGuidanceId === line.id) ? 'opacity-100' : 'opacity-20'}`}>
                <path 
                  d={`M ${line.x1} ${line.y1} C ${line.isLeft ? line.x1 + 50 : line.x1 - 50} ${line.y1}, ${line.isLeft ? line.x2 - 50 : line.x2 + 50} ${line.y2}, ${line.x2} ${line.y2}`}
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth={hoveredGuidanceId === line.id ? "3" : "2"} 
                  strokeDasharray={hoveredGuidanceId === line.id ? "none" : "4 4"}
                  className={hoveredGuidanceId === line.id ? "" : "animate-pulse"}
                />
                <circle cx={line.x2} cy={line.y2} r="4" fill="#10b981" />
              </g>
            ))}
          </svg>
        )}

        {/* Navigation Right */}
        <button 
          onClick={() => onPageChange(Math.min(maxPage, currentPage + step))}
          disabled={currentPage >= maxPage}
          className={`absolute right-0 z-30 p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all ${currentPage >= maxPage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderBookContent = () => {
    if (id !== 'sci-1-1') {
      return <div className="text-center text-slate-500 py-20">暂无内容</div>;
    }

    const currentTeacherGuidance = [...(teacherGuidanceData[currentTeacherPage] || []), ...(pageLayout === 'double' ? (teacherGuidanceData[currentTeacherPage + 1] || []) : [])];
    const currentStudentGuidance = [...(studentGuidanceData[currentStudentPage] || []), ...(pageLayout === 'double' ? (studentGuidanceData[currentStudentPage + 1] || []) : [])];

    return (
      <div className="h-full w-full flex relative bg-[#F5F7FA] overflow-hidden">
        {/* Main Content Area */}
        <div ref={contentAreaRef} className="flex-1 h-full flex flex-col relative overflow-hidden p-4">
          <div className="flex h-full w-full justify-center gap-8 px-4 relative">
            {viewMode === 'dual' && (
              <>
                <div className="flex-1 min-w-0 h-full flex flex-col items-center">
                  <div className="mb-2 text-sm font-bold text-slate-500">学生教材</div>
                  {renderBookView(studentPages, 'student', currentStudentPage, handleStudentPageChange)}
                </div>
                <div className="w-px bg-slate-200 h-full"></div>
                <div className="flex-1 min-w-0 h-full flex flex-col items-center">
                  <div className="mb-2 text-sm font-bold text-slate-500">教师用书</div>
                  {renderBookView(teacherPages, 'teacher', currentTeacherPage, handleTeacherPageChange)}
                </div>
              </>
            )}
            {viewMode === 'teacher' && (
              <div className="flex-1 min-w-0 h-full flex flex-col items-center">
                <div className="mb-2 text-sm font-bold text-slate-500">教师用书</div>
                {renderBookView(teacherPages, 'teacher', currentTeacherPage, handleTeacherPageChange)}
              </div>
            )}
            {viewMode === 'student' && (
              <div className="flex-1 min-w-0 h-full flex flex-col items-center">
                <div className="mb-2 text-sm font-bold text-slate-500">学生教材</div>
                {renderBookView(studentPages, 'student', currentStudentPage, handleStudentPageChange)}
              </div>
            )}
          </div>
        </div>

        {/* Guidance Sidebar */}
        {isGuidanceMode && viewMode === 'dual' && (
          <div className="w-80 h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-40">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
              <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                教学融合指导
              </h3>
              <button 
                onClick={() => setIsGuidanceMode(false)}
                className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentTeacherGuidance.length === 0 && currentStudentGuidance.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">暂无指导内容</p>
                  <p className="text-xs text-slate-400">当前页面没有相关的教学融合指导</p>
                </div>
              )}

              {currentTeacherGuidance.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">教师指导建议</div>
                  {currentTeacherGuidance.map(guide => (
                    <div 
                      key={guide.id} 
                      id={`guide-card-${guide.id}`}
                      onMouseEnter={() => setHoveredGuidanceId(guide.id)}
                      onMouseLeave={() => setHoveredGuidanceId(null)}
                      className={`p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm transition-all cursor-default ${hoveredGuidanceId === guide.id ? 'bg-emerald-50 border-emerald-600 shadow-md ring-1 ring-emerald-200' : 'bg-[#fdfbf7] border-emerald-500'}`}
                    >
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">{guide.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{guide.content}</p>
                      {guide.resourceId && (
                        <div className="mt-3 pt-2 border-t border-emerald-100/50">
                          <ResourceMarker resourceId={guide.resourceId} onClick={handleMarkerClick} isActive={previewResource?.id === guide.resourceId} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentStudentGuidance.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">学生学习引导</div>
                  {currentStudentGuidance.map(guide => (
                    <div 
                      key={guide.id} 
                      id={`guide-card-${guide.id}`}
                      onMouseEnter={() => setHoveredGuidanceId(guide.id)}
                      onMouseLeave={() => setHoveredGuidanceId(null)}
                      className={`p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm transition-all cursor-default ${hoveredGuidanceId === guide.id ? 'bg-emerald-50 border-emerald-600 shadow-md ring-1 ring-emerald-200' : 'bg-[#fdfbf7] border-emerald-500'}`}
                    >
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">{guide.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{guide.content}</p>
                      {guide.resourceId && (
                        <div className="mt-3 pt-2 border-t border-emerald-100/50">
                          <ResourceMarker resourceId={guide.resourceId} onClick={handleMarkerClick} isActive={previewResource?.id === guide.resourceId} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentTeacherGuidance.length === 0 && currentStudentGuidance.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">当前页面暂无指导建议</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Sidebar */}
        {isNotesMode && (
          <div className="w-80 h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-40">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                教学随笔 / 批注
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAllNotes(!showAllNotes)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${showAllNotes ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                >
                  {showAllNotes ? '全部' : '本页'}
                </button>
                <button 
                  onClick={() => setIsNotesMode(false)}
                  className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {(viewMode === 'dual' || viewMode === 'student') && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">教材批注 {showAllNotes ? '(全部)' : `(第${currentStudentPage + 1}页)`}</div>
                  {annotations.filter(a => a.bookId === id && a.type === 'student' && (showAllNotes || a.pageNumber === currentStudentPage)).length === 0 ? (
                    <div className="text-xs text-slate-400 px-1">暂无批注，请在左侧页面框选添加</div>
                  ) : (
                    annotations.filter(a => a.bookId === id && a.type === 'student' && (showAllNotes || a.pageNumber === currentStudentPage))
                      .sort((a, b) => a.pageNumber - b.pageNumber || b.updatedAt - a.updatedAt)
                      .map(ann => (
                      <AnnotationSidebarItem
                        key={ann.id}
                        annotation={ann}
                        isActive={activeAnnotationId === ann.id}
                        onClick={() => {
                          if (ann.pageNumber !== currentStudentPage) {
                            setCurrentStudentPage(ann.pageNumber);
                            if (isPageSyncEnabled) setCurrentTeacherPage(ann.pageNumber);
                          }
                          setActiveAnnotationId(ann.id);
                        }}
                        onUpdate={(updated) => setAnnotations(prev => prev.map(a => a.id === updated.id ? updated : a))}
                        onDelete={(annId) => {
                          setAnnotations(prev => prev.filter(a => a.id !== annId));
                          if (activeAnnotationId === annId) setActiveAnnotationId(null);
                        }}
                        onClose={() => setActiveAnnotationId(null)}
                        onPreviewImage={setPreviewImageUrl}
                      />
                    ))
                  )}
                </div>
              )}
              {(viewMode === 'dual' || viewMode === 'teacher') && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">教参批注 {showAllNotes ? '(全部)' : `(第${currentTeacherPage + 1}页)`}</div>
                  {annotations.filter(a => a.bookId === id && a.type === 'teacher' && (showAllNotes || a.pageNumber === currentTeacherPage)).length === 0 ? (
                    <div className="text-xs text-slate-400 px-1">暂无批注，请在右侧页面框选添加</div>
                  ) : (
                    annotations.filter(a => a.bookId === id && a.type === 'teacher' && (showAllNotes || a.pageNumber === currentTeacherPage))
                      .sort((a, b) => a.pageNumber - b.pageNumber || b.updatedAt - a.updatedAt)
                      .map(ann => (
                      <AnnotationSidebarItem
                        key={ann.id}
                        annotation={ann}
                        isActive={activeAnnotationId === ann.id}
                        onClick={() => {
                          if (ann.pageNumber !== currentTeacherPage) {
                            setCurrentTeacherPage(ann.pageNumber);
                            if (isPageSyncEnabled) setCurrentStudentPage(ann.pageNumber);
                          }
                          setActiveAnnotationId(ann.id);
                        }}
                        onUpdate={(updated) => setAnnotations(prev => prev.map(a => a.id === updated.id ? updated : a))}
                        onDelete={(annId) => {
                          setAnnotations(prev => prev.filter(a => a.id !== annId));
                          if (activeAnnotationId === annId) setActiveAnnotationId(null);
                        }}
                        onClose={() => setActiveAnnotationId(null)}
                        onPreviewImage={setPreviewImageUrl}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button 
                 onClick={handleExportAnnotations}
                 className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
               >
                 <Download className="w-4 h-4" />
                 导出全部批注
               </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Toolbar */}
      <header 
        className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm"
        style={{ zIndex: zIndices.header }}
      >
        <div className="flex items-center gap-4">
          {!isFullscreen && (
            <>
              <Link to="/" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-slate-200"></div>
            </>
          )}
          <div className="flex items-center gap-2">
            {currentBook && (
              <>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${currentBook.coverColor.split(' ')[0]} ${currentBook.coverColor.split(' ')[1]}`}>
                  {currentBook.subject}
                </span>
                <span className="font-semibold text-slate-800">
                  {currentBook.subject}{currentBook.grade}{currentBook.term}{currentBook.version}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'student' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              教材
            </button>
            <button 
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'dual' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              双屏对照
            </button>
            <button 
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'teacher' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              教参
            </button>
          </div>

          {/* Page Sync Toggle */}
          {viewMode === 'dual' && (
            <button
              onClick={() => setIsPageSyncEnabled(!isPageSyncEnabled)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isPageSyncEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
              title={isPageSyncEnabled ? "关闭联动翻页" : "开启联动翻页"}
            >
              {isPageSyncEnabled ? <LinkIcon className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
              {isPageSyncEnabled ? "联动翻页" : "独立翻页"}
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* Page Layout Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setPageLayout('single')}
              className={`p-1.5 rounded-md transition-colors ${pageLayout === 'single' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="单页视图"
            >
              <Square className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPageLayout('double')}
              className={`p-1.5 rounded-md transition-colors ${pageLayout === 'double' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="双页视图"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          <button 
            onClick={() => setIsNotesMode(!isNotesMode)}
            className={`p-2 rounded-lg transition-colors ${isNotesMode ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`} 
            title="笔记/批注模式"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
            className={`p-2 rounded-lg transition-colors ${isWhiteboardActive ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`} 
            title="全局白板"
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="分享">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsGuidanceMode(!isGuidanceMode)}
            className={`p-2 rounded-lg transition-colors ${isGuidanceMode ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            title={isGuidanceMode ? "关闭教学融合指导" : "开启教学融合指导"}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          {/* Resource Legend Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowLegend(!showLegend);
                if (!showLegend) bringToFront('legend');
              }}
              className={`p-2 rounded-lg transition-colors ${showLegend ? 'text-orange-600 bg-orange-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              title="图例说明"
            >
              <Info className="w-5 h-5" />
            </button>
            {showLegend && (
              <div 
                onClick={() => bringToFront('legend')}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200"
                style={{ zIndex: zIndices.legend }}
              >
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">图例说明</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">RESOURCE LEGEND</p>
                  </div>
                  <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <LegendItem 
                    type="V" label="音视频类" subLabel="VIDEO" iconSrc="/assets/V类资源图标.png" 
                    subCategories={[
                      { id: 'V-1', name: '情景导入类' },
                      { id: 'V-2', name: '原理动画类' },
                      { id: 'V-3', name: '实录微课类' },
                      { id: 'V-4', name: 'AIGC讲解类' }
                    ]}
                  />
                  <LegendItem 
                    type="A" label="课堂提问类" subLabel="ASKING" iconSrc="/assets/A类资源图标.png" 
                    subCategories={[
                      { id: 'A-1', name: '启发式提问' },
                      { id: 'A-2', name: '互动式问答' },
                      { id: 'A-3', name: '探究式问题' },
                      { id: 'A-4', name: 'AI问答' }
                    ]}
                  />
                  <LegendItem 
                    type="P" label="图片类" subLabel="PICTURE" iconSrc="/assets/P类资源图标.png" 
                    subCategories={[
                      { id: 'P-1', name: '思维导图类' },
                      { id: 'P-2', name: '结构图谱类' },
                      { id: 'P-3', name: '实物图解类' },
                      { id: 'P-4', name: '表单模板类' }
                    ]}
                  />
                  <LegendItem 
                    type="i" label="互动类" subLabel="INTERACT" iconSrc="/assets/i类资源图标.png" 
                    subCategories={[
                      { id: 'I-1', name: '测评练习类' },
                      { id: 'I-2', name: '工具仿真类' },
                      { id: 'I-3', name: '虚拟操作类' }
                    ]}
                  />
                  <LegendItem 
                    type="D" label="文档/数据类" subLabel="DOC" iconSrc="/assets/D类资源图标.png" 
                    subCategories={[
                      { id: 'D-1', name: '电子手册类' },
                      { id: 'D-2', name: '行业案例库类' },
                      { id: 'D-3', name: '资讯报告类' }
                    ]}
                  />
                </div>
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-xl">
                  <span className="text-xs font-medium text-slate-600">资源名称常显</span>
                  <button 
                    onClick={() => setIsTooltipAlwaysOn(!isTooltipAlwaysOn)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isTooltipAlwaysOn ? 'bg-orange-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isTooltipAlwaysOn ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button 
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${isFullscreen ? 'text-orange-600 bg-orange-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            title="全屏沉浸阅读"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Student Book View */}
        <div className="flex-1 h-full overflow-hidden bg-[#F5F7FA] relative scroll-smooth transition-all duration-300">
          {renderBookContent()}
        </div>
      </div>

      {/* Prep Configuration Modal */}
      {showPrepConfig && (
        <div 
          onClick={() => bringToFront('prep')}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          style={{ zIndex: zIndices.prep }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-orange-500" />
                智能备课预设条件
              </h3>
              <button onClick={() => setShowPrepConfig(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-slate-50/50">
              {/* Chapter Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">当前章节课时</label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-between">
                  <span>{currentBook?.title || '未知章节'}</span>
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">将基于当前阅读的教材章节生成教案内容。</p>
              </div>

              {/* Complexity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">教案复杂性</label>
                <div className="grid grid-cols-3 gap-3">
                  {['简案', '标准', '详案'].map(level => (
                    <button
                      key={level}
                      onClick={() => setPrepComplexity(level)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        prepComplexity === level
                          ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">生成目标</label>
                <div className="grid grid-cols-3 gap-3">
                  {['新授课', '复习课', '练习课', '实验课', '活动课', '公开课'].map(obj => (
                    <button
                      key={obj}
                      onClick={() => setPrepObjective(obj)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        prepObjective === obj
                          ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Profile and Teaching Style Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">学情</label>
                  <select 
                    value={prepStudentProfile} 
                    onChange={(e) => setPrepStudentProfile(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>常规班级</option>
                    <option>培优班级</option>
                    <option>基础薄弱班级</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">教学风格</label>
                  <select 
                    value={prepTeachingStyle} 
                    onChange={(e) => setPrepTeachingStyle(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>游戏互动为主</option>
                    <option>讲授为主</option>
                    <option>探究实验为主</option>
                  </select>
                </div>
              </div>

              {/* Custom Requirements */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">自定义要求 (选填)</label>
                <textarea
                  value={prepCustomReq}
                  onChange={(e) => setPrepCustomReq(e.target.value)}
                  placeholder="例如：重点关注后进生的理解，增加小组讨论环节..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowPrepConfig(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmGeneratePrep}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                确认并生成教案
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Preview Modal */}
      {previewResource && (
        <div 
          onClick={() => { setPreviewResource(null); setIsPlaying(false); }}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 sm:p-8"
          style={{ zIndex: zIndices.preview }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  previewResource.type === 'V' ? 'bg-orange-50 text-orange-500' :
                  previewResource.type === 'P' ? 'bg-emerald-50 text-emerald-500' :
                  previewResource.type === 'A' ? 'bg-amber-50 text-amber-500' :
                  previewResource.type === 'D' ? 'bg-purple-50 text-purple-500' :
                  'bg-rose-50 text-rose-500'
                }`}>
                  {previewResource.type === 'V' && <Video className="w-6 h-6" />}
                  {previewResource.type === 'P' && <ImageIcon className="w-6 h-6" />}
                  {previewResource.type === 'A' && <MessageCircle className="w-6 h-6" />}
                  {previewResource.type === 'D' && <FileText className="w-6 h-6" />}
                  {previewResource.type === 'i' && <MonitorPlay className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 leading-tight">{previewResource.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                      {previewResource.format || 'RESOURCE'}
                    </span>
                    {previewResource.size && (
                      <span className="text-xs font-medium text-slate-400">
                        {previewResource.size}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
                  <Download className="w-4 h-4" /> 下载
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-200">
                  <MonitorPlay className="w-4 h-4" /> 投屏授课
                </button>
                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                <button onClick={() => { setPreviewResource(null); setIsPlaying(false); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden bg-slate-50">
              {/* Main Content Area */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
                  {/* Video Player */}
                  {previewResource.type === 'V' && (
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl flex items-center justify-center relative group shadow-2xl overflow-hidden ring-1 ring-white/10">
                      {!isPlaying ? (
                        <>
                          <img src={`https://picsum.photos/seed/${previewResource.id}/1280/720`} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                          <button 
                            onClick={() => setIsPlaying(true)}
                            className="w-24 h-24 bg-orange-500 text-white rounded-full flex items-center justify-center z-10 hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-orange-500/40"
                          >
                            <Play className="w-12 h-12 ml-1.5" />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-white/60 text-sm font-medium">正在缓冲高清资源...</p>
                          <button 
                            onClick={() => setIsPlaying(false)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      
                      {/* Video Controls */}
                      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end px-8 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full flex flex-col gap-3">
                          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress">
                            <div className="w-1/3 h-full bg-orange-500 relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-orange-400 transition-colors">
                                {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                              </button>
                              <span className="text-white text-sm font-mono tracking-wider">01:24 / 04:30</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <Settings2 className="w-5 h-5 text-white/70 hover:text-white cursor-pointer" />
                              <Maximize className="w-5 h-5 text-white/70 hover:text-white cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Q&A / Teaching Reference */}
                  {previewResource.type === 'A' && (
                    <div className="w-full max-w-3xl h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                      <div className="p-8 bg-amber-50/50 border-b border-amber-100 shrink-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                            <MessageCircle className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{previewResource.title}</h4>
                            <p className="text-amber-700/60 text-sm font-bold uppercase tracking-widest mt-0.5">{previewResource.format}</p>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-lg">
                          {previewResource.description}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fdfbf7]">
                        {mockQAData[previewResource.id] ? (
                          mockQAData[previewResource.id].map((item, idx) => (
                            <div key={idx} className="group">
                              <button 
                                onClick={() => toggleQa(`${previewResource.id}-${idx}`)}
                                className="w-full flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all text-left"
                              >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-sm">Q</div>
                                <div className="flex-1 pt-1">
                                  <div className="font-bold text-slate-800 text-lg group-hover:text-amber-700 transition-colors">{item.q}</div>
                                  {qaExpanded[`${previewResource.id}-${idx}`] && (
                                    <div className="mt-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                      <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-sm">A</div>
                                        <p className="text-slate-600 leading-relaxed text-lg">{item.a}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className={`mt-2 transition-transform duration-300 ${qaExpanded[`${previewResource.id}-${idx}`] ? 'rotate-180' : ''}`}>
                                  <Plus className={`w-5 h-5 text-slate-300 group-hover:text-amber-400 ${qaExpanded[`${previewResource.id}-${idx}`] ? 'hidden' : 'block'}`} />
                                  <X className={`w-5 h-5 text-amber-500 ${qaExpanded[`${previewResource.id}-${idx}`] ? 'block' : 'hidden'}`} />
                                </div>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                            <Info className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">暂无详细问答内容</p>
                            <p className="text-sm mt-2 opacity-60">请参考资源描述或下载完整文档</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image / PPT */}
                  {previewResource.type === 'P' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                      <div className="relative max-w-4xl max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl bg-white p-3 ring-1 ring-slate-200 group">
                        <img 
                          src={`https://picsum.photos/seed/${previewResource.id}/1600/1000`} 
                          alt={previewResource.title} 
                          className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" 
                        />
                        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-white hover:text-orange-500 transition-all">
                            <Plus className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-700 hover:bg-white hover:text-orange-500 transition-all">
                            <Minimize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white/80 backdrop-blur p-2 rounded-2xl shadow-lg border border-white">
                        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === 1 ? 'bg-orange-500 w-8' : 'bg-slate-200 hover:bg-slate-300'}`}></div>
                          ))}
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Document / Interactive */}
                  {['D', 'i'].includes(previewResource.type) && (
                    <div className="w-full max-w-5xl h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-inner"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-inner"></div>
                          </div>
                          <div className="h-4 w-px bg-slate-200"></div>
                          <div className="text-sm font-bold text-slate-500 tracking-tight">
                            {previewResource.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex bg-slate-200/50 p-1 rounded-lg">
                            <button className="px-3 py-1 text-xs font-bold text-slate-600 bg-white rounded shadow-sm">预览</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">源码</button>
                          </div>
                          <Maximize className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex-1 flex overflow-hidden">
                        {/* Doc Sidebar (Mock) */}
                        <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 overflow-y-auto hidden md:block">
                          <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className={`aspect-[3/4] rounded-lg border-2 transition-all cursor-pointer ${i === 1 ? 'border-orange-500 ring-2 ring-orange-100 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-300">PAGE {i}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Doc Content */}
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-100/30 relative">
                          {previewResource.type === 'i' && (
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                              <div className="w-full h-full bg-white rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-slate-200/50 border-dashed">
                                <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 text-rose-300 animate-pulse">
                                  <MonitorPlay className="w-12 h-12" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-800 mb-4">互动实验加载中</h4>
                                <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg">
                                  正在为您准备《{previewResource.title}》的交互式学习环境，请稍候...
                                </p>
                                <div className="mt-10 flex items-center gap-3">
                                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce"></div>
                                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {previewResource.type === 'D' && (
                            <div className="w-full h-full max-w-2xl bg-white shadow-xl rounded-lg p-16 text-left flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <div className="space-y-4">
                                <div className="h-8 bg-slate-100 rounded-md w-3/4"></div>
                                <div className="h-4 bg-slate-50 rounded-md w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-md w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-md w-5/6"></div>
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="aspect-video bg-slate-50 rounded-xl"></div>
                                <div className="aspect-video bg-slate-50 rounded-xl"></div>
                              </div>
                              <div className="space-y-4">
                                <div className="h-4 bg-slate-50 rounded-md w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-md w-full"></div>
                                <div className="h-4 bg-slate-50 rounded-md w-2/3"></div>
                              </div>
                              <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center text-slate-300 font-mono text-xs">
                                <span>CONFIDENTIAL TEACHING MATERIAL</span>
                                <span>PAGE 01 / 12</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Side Info Panel */}
              <div className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-6 border-b border-slate-50">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">资源详情</h4>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2">资源描述</div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {previewResource.description || '暂无详细描述'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">文件格式</div>
                        <div className="text-sm font-black text-slate-700">{previewResource.format || '未知'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">资源大小</div>
                        <div className="text-sm font-black text-slate-700">{previewResource.size || '--'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">相关推荐</h4>
                  <div className="space-y-4">
                    {Object.values(mockResources).slice(0, 3).map((res: any) => (
                      <div key={res.id} className="group cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-orange-500 transition-all shadow-sm">
                            {res.type === 'V' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 truncate group-hover:text-orange-600 transition-colors">{res.title}</div>
                            <div className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-tighter">{res.format} • {res.size || '1.2MB'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <button className="w-full py-4 bg-white border-2 border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-600 rounded-2xl text-sm font-black transition-all shadow-sm">
                    查看完整资源库
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Mode Overlay */}
      {presentationArea && (
        <div 
          className="fixed inset-0 bg-slate-900 flex flex-col animate-in fade-in duration-300"
          style={{ zIndex: 80 }}
        >
          {/* Header */}
          <div className="h-14 px-6 flex items-center justify-between bg-slate-900 text-white border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <MonitorPlay className="w-5 h-5 text-orange-500" />
              <span className="font-bold tracking-wide">课件授课模式</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md ml-2">已隐藏无关信息，聚焦选中区域</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPresentationZoom(1)} 
                className={`p-2 rounded-lg transition-colors ${presentationZoom !== 1 ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="重置缩放"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                className={`p-2 rounded-lg transition-colors ${isWhiteboardActive ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} 
                title="全局白板"
              >
                <PenTool className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-800"></div>
              <button onClick={() => { setPresentationArea(null); setPresentationZoom(1); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div 
            className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-slate-950 cursor-zoom-in"
            onWheel={(e) => {
              e.preventDefault();
              const zoomStep = 0.02;
              if (e.deltaY < 0) {
                setPresentationZoom(prev => Math.min(prev + zoomStep, 5));
              } else {
                setPresentationZoom(prev => Math.max(prev - zoomStep, 0.2));
              }
            }}
          >
            {(() => {
              const aspect = presentationArea.containerAspect * (presentationArea.width / presentationArea.height);
              return (
                <div 
                  className="relative overflow-hidden shadow-2xl bg-white rounded-xl ring-1 ring-white/10 transition-transform duration-200 ease-out"
                  style={{
                    width: aspect > 1 ? 'min(90vw, 90vh * ' + aspect + ')' : 'min(85vh * ' + aspect + ', 90vw)',
                    height: aspect > 1 ? 'min(90vw / ' + aspect + ', 85vh)' : 'min(85vh, 90vw / ' + aspect + ')',
                    aspectRatio: `${aspect}`,
                    transform: `scale(${presentationZoom})`,
                  }}
                >
                  <div 
                    className="absolute top-0 left-0"
                    style={{
                      width: `${10000 / presentationArea.width}%`,
                      height: `${10000 / presentationArea.height}%`,
                      left: `-${(presentationArea.x / presentationArea.width) * 100}%`,
                      top: `-${(presentationArea.y / presentationArea.height) * 100}%`,
                    }}
                  >
                    <img 
                      src={presentationArea.src} 
                      className="w-full h-full object-fill block" 
                      referrerPolicy="no-referrer"
                      alt="Focused content"
                    />
                  </div>
                </div>
              );
            })()}
            
            {/* Zoom Indicator */}
            <div className="absolute bottom-8 right-8 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-slate-700 flex items-center gap-3 shadow-2xl">
              <span className="text-slate-400">缩放</span>
              <div className="flex items-center gap-1 bg-slate-800 rounded-md p-0.5">
                <button 
                  onClick={() => setPresentationZoom(prev => Math.max(prev - 0.1, 0.2))}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="缩小"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-orange-500 w-12 text-center">{(presentationZoom * 100).toFixed(0)}%</span>
                <button 
                  onClick={() => setPresentationZoom(prev => Math.min(prev + 0.1, 5))}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="放大"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button onClick={() => setPresentationZoom(1)} className="text-xs hover:text-orange-400 transition-colors px-2">重置</button>
            </div>
            
            <div className="absolute bottom-8 left-8 text-slate-500 text-xs bg-slate-900/40 px-3 py-1.5 rounded-lg">
              提示：使用鼠标滚轮可进一步放大/缩小内容
            </div>
          </div>
        </div>
      )}

      {/* Whiteboard Overlay */}
      <WhiteboardOverlay isActive={isWhiteboardActive} onClose={() => setIsWhiteboardActive(false)} />

      {/* Image Preview Overlay */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img 
            src={previewImageUrl} 
            alt="预览图片" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={() => setPreviewImageUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

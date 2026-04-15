import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PenTool, Settings2, Sparkles, Clock, CheckCircle2, Download, RefreshCw, PlayCircle, Presentation, Gamepad2, ChevronRight, Plus, Eye, X, Image as ImageIcon, FileText, Type as TypeIcon, Shapes, MousePointerClick, Wand2, LayoutTemplate, Maximize, Minimize } from 'lucide-react';
import { textbooks, mockResources } from '../data/mockData';
import { GoogleGenAI, Type } from '@google/genai';

export interface LessonStep {
  id: number;
  title: string;
  duration: number;
  type: string;
  teacherScript: string;
  aiTips: string[];
  resourceIds: string[];
  tools?: string[];
}

export interface LessonPlan {
  objectives: {
    knowledge: string;
    ability: string;
    emotion: string;
  };
  steps: LessonStep[];
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'resource' | 'game' | 'activity';
  resourceId?: string;
  gameType?: string;
  notes: string;
}

export default function LessonPrep() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get state passed from Reader or TeachingLoop
  const state = location.state as { 
    bookId?: string, 
    resources?: string[], 
    remixPlan?: LessonPlan,
    prepConfig?: {
      complexity: string,
      objective: string,
      customReq: string,
      chapter: string,
      studentProfile?: string,
      teachingStyle?: string
    }
  } | null;
  const selectedBookId = state?.bookId || 'sci-1-1';
  const selectedBook = textbooks.find(b => b.id === selectedBookId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [studentProfile, setStudentProfile] = useState(state?.prepConfig?.studentProfile || '常规班级');
  const [teachingStyle, setTeachingStyle] = useState(state?.prepConfig?.teachingStyle || '游戏互动为主');
  const [customObjective, setCustomObjective] = useState(state?.prepConfig?.customReq || '');
  const [grade, setGrade] = useState(selectedBook?.grade || '一年级上册');
  const [version, setVersion] = useState('人教版');
  const [subject, setSubject] = useState(selectedBook?.subject || '科学');
  const [chapter, setChapter] = useState(state?.prepConfig?.chapter || '第一单元 植物');
  const [lesson, setLesson] = useState(state?.prepConfig?.chapter || '第1课 我们知道的植物');
  const [complexity, setComplexity] = useState(state?.prepConfig?.complexity || '标准');
  const [objective, setObjective] = useState(state?.prepConfig?.objective || '新授课');
  const [isEditing, setIsEditing] = useState(false);
  const [prepStage, setPrepStage] = useState<'plan' | 'courseware'>('plan');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const [showCoursewareConfig, setShowCoursewareConfig] = useState(false);
  const [isGeneratingCourseware, setIsGeneratingCourseware] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [cwStyle, setCwStyle] = useState('卡通可爱');
  const [cwPages, setCwPages] = useState('10-15页');
  const [cwTemplate, setCwTemplate] = useState('默认模板');
  
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(state?.resources || []);
  const [previewResource, setPreviewResource] = useState<any>(null);

  // z-index management for panels
  const [zIndices, setZIndices] = useState({
    preview: 70,
    config: 71
  });

  const bringToFront = (panel: keyof typeof zIndices) => {
    setZIndices(prev => {
      const maxZ = Math.max(...(Object.values(prev) as number[]));
      return { ...prev, [panel]: maxZ + 1 };
    });
  };

  // Auto-generate if coming from Reader with resources, or load remixPlan
  useEffect(() => {
    if (state?.remixPlan) {
      setLessonPlan(state.remixPlan);
      setHasGenerated(true);
      setIsEditing(true); // Auto-enter edit mode for remixing
    } else if (state?.resources && state.resources.length > 0 && !hasGenerated && !isGenerating) {
      handleGenerate();
    }
  }, [state]);

  const handleImportLocalPlan = () => {
    setIsImporting(true);
    // Simulate file upload and parsing delay
    setTimeout(() => {
      const mockImportedPlan: LessonPlan = {
        objectives: {
          knowledge: "（本地导入）了解本课的核心概念和基础知识。",
          ability: "（本地导入）能够运用所学知识解决实际问题，培养动手操作能力。",
          emotion: "（本地导入）激发学习兴趣，培养团队合作精神和探究意识。"
        },
        steps: [
          {
            id: 1,
            title: "导入新课 (本地)",
            duration: 5,
            type: "导入",
            teacherScript: "同学们，今天我们来学习一个新的内容。大家看大屏幕...",
            aiTips: ["注意吸引学生注意力，可以结合生活实际。"],
            resourceIds: []
          },
          {
            id: 2,
            title: "核心讲解 (本地)",
            duration: 20,
            type: "讲授",
            teacherScript: "这是本节课的核心知识点，请大家认真听讲并做好笔记...",
            aiTips: ["讲解时注意语速，适时停顿让学生思考。"],
            resourceIds: []
          },
          {
            id: 3,
            title: "随堂练习 (本地)",
            duration: 10,
            type: "练习",
            teacherScript: "现在我们来做几道练习题，检验一下大家的学习成果。",
            aiTips: ["巡视课堂，关注基础薄弱的学生。"],
            resourceIds: []
          },
          {
            id: 4,
            title: "课堂总结 (本地)",
            duration: 5,
            type: "总结",
            teacherScript: "今天我们学习了...，希望大家课后认真复习。",
            aiTips: ["总结要简明扼要，突出重难点。"],
            resourceIds: []
          }
        ]
      };
      setLessonPlan(mockImportedPlan);
      setHasGenerated(true);
      setIsEditing(true);
      setIsImporting(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setHasGenerated(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const resourcesText = selectedResourceIds.map(id => {
        const res = mockResources[id];
        return res ? `- ID: ${id} | Title: ${res.title} (${res.type}): ${res.description}` : '';
      }).filter(Boolean).join('\n');

      const prompt = `
        You are an expert teacher preparing a lesson plan.
        Subject: ${subject}
        Grade: ${grade}
        Version: ${version}
        Chapter: ${chapter}
        Topic: ${lesson}
        Student Profile: ${studentProfile}
        Teaching Style: ${teachingStyle}
        Lesson Plan Complexity: ${complexity}
        Generation Objective: ${objective}
        Custom Requirements: ${customObjective || 'None provided'}
        
        Selected Resources to include in the lesson:
        ${resourcesText || 'None'}
        
        Generate a structured lesson plan that incorporates the selected resources where appropriate.
        Total duration should be around 40 minutes.
        IMPORTANT: In the 'resourceIds' array for each step, you MUST use the exact IDs provided in the 'Selected Resources' list above (e.g., 'sci-res-1'). Do not invent new IDs.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objectives: {
                type: Type.OBJECT,
                properties: {
                  knowledge: { type: Type.STRING },
                  ability: { type: Type.STRING },
                  emotion: { type: Type.STRING },
                },
                required: ["knowledge", "ability", "emotion"],
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    duration: { type: Type.NUMBER, description: "Duration in minutes" },
                    type: { type: Type.STRING, description: "e.g., 互动, 探究, 实践, 总结" },
                    teacherScript: { type: Type.STRING, description: "Teacher's script for this step" },
                    aiTips: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "AI tips for the teacher"
                    },
                    resourceIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "IDs of the resources used in this step"
                    }
                  },
                  required: ["id", "title", "duration", "type", "teacherScript", "aiTips", "resourceIds"],
                }
              }
            },
            required: ["objectives", "steps"],
          }
        }
      });

      const plan = JSON.parse(response.text || '{}') as LessonPlan;
      setLessonPlan(plan);
      setHasGenerated(true);
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
      // Fallback or error handling could be added here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCourseware = () => {
    if (!lessonPlan) return;
    setShowCoursewareConfig(true);
    bringToFront('config');
  };

  const confirmGenerateCourseware = () => {
    setIsGeneratingCourseware(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      // Auto-generate slides based on lesson plan steps
      const newSlides: Slide[] = [];
      
      // Title slide
      newSlides.push({
        id: 'slide-title',
        title: selectedBook?.title || '课程标题',
        content: `科目：${selectedBook?.subject}\n年级：${selectedBook?.grade}\n\n风格：${cwStyle}\n模板：${cwTemplate}`,
        type: 'text',
        notes: '欢迎来到本节课！'
      });

      // Objectives slide
      newSlides.push({
        id: 'slide-obj',
        title: '教学目标',
        content: `知识目标：${lessonPlan!.objectives.knowledge}\n能力目标：${lessonPlan!.objectives.ability}\n情感目标：${lessonPlan!.objectives.emotion}`,
        type: 'text',
        notes: '向学生展示本节课的学习目标。'
      });

      // Steps slides
      lessonPlan!.steps.forEach((step, index) => {
        newSlides.push({
          id: `slide-step-${index}`,
          title: step.title,
          content: step.teacherScript,
          type: 'text',
          notes: step.aiTips.join('\n')
        });

        // Add resource slides if any
        if (step.resourceIds && step.resourceIds.length > 0) {
          step.resourceIds.forEach((resId, rIdx) => {
            const res = mockResources[resId];
            if (res) {
              newSlides.push({
                id: `slide-res-${index}-${rIdx}`,
                title: `资源：${res.title}`,
                content: res.description,
                type: 'resource',
                resourceId: resId,
                notes: `展示资源：${res.title}`
              });
            }
          });
        }

        // Add tool/game slides if any
        if (step.tools && step.tools.length > 0) {
          step.tools.forEach((tool, tIdx) => {
            newSlides.push({
              id: `slide-tool-${index}-${tIdx}`,
              title: `互动环节：${tool}`,
              content: `进行 ${tool} 活动`,
              type: 'game',
              gameType: tool,
              notes: `组织学生进行 ${tool} 互动。`
            });
          });
        }
      });

      setSlides(newSlides);
      setIsGeneratingCourseware(false);
      setShowCoursewareConfig(false);
      setPrepStage('courseware');
      setActiveSlideIndex(0);
    }, 2000);
  };

  const handleStartClass = () => {
    navigate('/assistant', { state: { lessonPlan, slides, bookId: selectedBookId } });
  };

  const updateStep = (index: number, field: keyof LessonStep, value: any) => {
    if (!lessonPlan) return;
    const newSteps = [...lessonPlan.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setLessonPlan({ ...lessonPlan, steps: newSteps });
  };

  const addToolToStep = (index: number, tool: string) => {
    if (!lessonPlan) return;
    const newSteps = [...lessonPlan.steps];
    const currentTools = newSteps[index].tools || [];
    if (!currentTools.includes(tool)) {
      newSteps[index] = { ...newSteps[index], tools: [...currentTools, tool] };
      setLessonPlan({ ...lessonPlan, steps: newSteps });
    }
  };

  const removeToolFromStep = (index: number, tool: string) => {
    if (!lessonPlan) return;
    const newSteps = [...lessonPlan.steps];
    const currentTools = newSteps[index].tools || [];
    newSteps[index] = { ...newSteps[index], tools: currentTools.filter(t => t !== tool) };
    setLessonPlan({ ...lessonPlan, steps: newSteps });
  };

  const availableTools = ['🎲 随机点名', '⏱️ 计时器', '📊 投票', '🎮 拼图游戏', '📝 随堂测验'];
  const availableGames = ['连连看', '知识问答', '情景模拟', '角色扮演', '小组PK'];

  const addGameToSlide = (game: string) => {
    const newSlide: Slide = {
      id: `slide-game-${Date.now()}`,
      title: `互动游戏：${game}`,
      content: `点击开始 ${game} 游戏`,
      type: 'game',
      gameType: game,
      notes: `引导学生参与 ${game} 游戏，活跃课堂气氛。`
    };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Top Stepper */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-center">
        <div className="flex items-center max-w-3xl w-full">
          <div className={`flex items-center gap-2 ${prepStage === 'plan' ? 'text-orange-600' : 'text-slate-500 cursor-pointer hover:text-orange-500'}`} onClick={() => setPrepStage('plan')}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${prepStage === 'plan' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>1</div>
            <span className="font-medium">教案制作</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${prepStage === 'courseware' ? 'text-orange-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${prepStage === 'courseware' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>2</div>
            <span className="font-medium">课件制作与互动排版</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-slate-100 text-slate-400">3</div>
            <span className="font-medium">课堂演示</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {prepStage === 'plan' ? (
          <>
            {/* Left Panel: Configuration */}
            <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-orange-500" />
                  备课参数配置
                </h2>
              </div>
              
              <div className="p-5 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">当前教材与课时</label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>一年级上册</option>
                        <option>一年级下册</option>
                        <option>二年级上册</option>
                      </select>
                      <select value={version} onChange={(e) => setVersion(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>人教版</option>
                        <option>苏教版</option>
                        <option>北师大版</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>科学</option>
                        <option>美术</option>
                        <option>音乐</option>
                        <option>英语</option>
                      </select>
                      <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>第一单元 植物</option>
                        <option>第二单元 动物</option>
                        <option>第三单元 天气</option>
                      </select>
                    </div>
                    <input 
                      type="text" 
                      value={lesson} 
                      onChange={(e) => setLesson(e.target.value)}
                      placeholder="课时名称"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">生成目标与复杂性</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>新授课</option>
                      <option>复习课</option>
                      <option>练习课</option>
                      <option>实验课</option>
                      <option>活动课</option>
                      <option>公开课</option>
                    </select>
                    <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>简案</option>
                      <option>标准</option>
                      <option>详案</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">学情与风格</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={studentProfile} onChange={(e) => setStudentProfile(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>常规班级</option>
                      <option>培优班级</option>
                      <option>基础薄弱班级</option>
                    </select>
                    <select value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>游戏互动为主</option>
                      <option>讲授为主</option>
                      <option>探究实验为主</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">自定义要求</label>
                  <textarea 
                    value={customObjective}
                    onChange={(e) => setCustomObjective(e.target.value)}
                    placeholder="例如：重点培养学生的动手实践能力，或者要求在课堂最后5分钟进行随堂测验..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                    <span>备课资源库 ({subject})</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const prefixMap: Record<string, string> = { '科学': 'sci', '美术': 'art', '音乐': 'mus', '英语': 'eng' };
                          const prefix = prefixMap[subject] || 'sci';
                          const availableResources = Object.values(mockResources).filter(res => res.id.startsWith(prefix));
                          if (selectedResourceIds.length === availableResources.length && availableResources.length > 0) {
                            setSelectedResourceIds([]);
                          } else {
                            setSelectedResourceIds(availableResources.map(res => res.id));
                          }
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors"
                      >
                        {Object.values(mockResources).filter(res => res.id.startsWith({'科学': 'sci', '美术': 'art', '音乐': 'mus', '英语': 'eng'}[subject] || 'sci')).length > 0 && selectedResourceIds.length === Object.values(mockResources).filter(res => res.id.startsWith({'科学': 'sci', '美术': 'art', '音乐': 'mus', '英语': 'eng'}[subject] || 'sci')).length ? '取消全选' : '全选'}
                      </button>
                      <span className="text-xs font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">已选 {selectedResourceIds.length} 项</span>
                    </div>
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Object.values(mockResources).filter(res => {
                      const prefixMap: Record<string, string> = { '科学': 'sci', '美术': 'art', '音乐': 'mus', '英语': 'eng' };
                      return res.id.startsWith(prefixMap[subject] || 'sci');
                    }).length > 0 ? Object.values(mockResources).filter(res => {
                      const prefixMap: Record<string, string> = { '科学': 'sci', '美术': 'art', '音乐': 'mus', '英语': 'eng' };
                      return res.id.startsWith(prefixMap[subject] || 'sci');
                    }).map(res => (
                      <div key={res.id} className={`flex items-center justify-between bg-white border p-2 rounded-lg transition-colors ${selectedResourceIds.includes(res.id) ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200 hover:border-orange-200'}`}>
                        <label className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden">
                          <input
                            type="checkbox"
                            checked={selectedResourceIds.includes(res.id)}
                            onChange={() => setSelectedResourceIds(prev => prev.includes(res.id) ? prev.filter(r => r !== res.id) : [...prev, res.id])}
                            className="text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <span className="text-xs text-slate-700 truncate" title={res.title}>{res.title}</span>
                        </label>
                        <button
                          onClick={() => {
                            setPreviewResource(res);
                            bringToFront('preview');
                          }}
                          className="p-1 text-slate-400 hover:text-orange-500 transition-colors shrink-0"
                          title="预览资源"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-100">该学科暂无可用资源。</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-200 bg-white space-y-3">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || isImporting}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isGenerating ? 'AI 正在融合资源生成教案...' : (hasGenerated ? '重新智能生成教案' : '智能生成教案')}
                </button>
                <button 
                  onClick={handleImportLocalPlan}
                  disabled={isGenerating || isImporting}
                  className="w-full py-3 bg-white border border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isImporting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 rotate-180" />
                  )}
                  {isImporting ? '正在解析本地教案...' : '导入本地教案'}
                </button>
              </div>
            </div>

            {/* Right Panel: Generated Content */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {!hasGenerated && !isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <PenTool className="w-16 h-16 mb-4 text-slate-200" />
                  <p>配置左侧参数，点击生成按钮获取专属教案</p>
                </div>
              ) : isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center text-orange-500 space-y-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-medium animate-pulse">正在深度解析《{selectedBook?.subject}》教材并融合您选择的资源...</p>
                </div>
              ) : lessonPlan ? (
                <>
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedBook?.title} - {isEditing ? '编辑教案' : '智能教案'}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lessonPlan.steps.reduce((acc, step) => acc + step.duration, 0)}分钟</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 已融合 {selectedResourceIds.length} 个自选资源</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          确认并保存
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <PenTool className="w-4 h-4" />
                            在线编辑
                          </button>
                          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            导出教案
                          </button>
                          <button 
                            onClick={handleGenerateCourseware}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                          >
                            <Presentation className="w-4 h-4" />
                            生成课件
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                    <h3>一、教学目标</h3>
                    <ul>
                      <li><strong>知识目标：</strong>{lessonPlan.objectives.knowledge}</li>
                      <li><strong>能力目标：</strong>{lessonPlan.objectives.ability}</li>
                      <li><strong>情感目标：</strong>{lessonPlan.objectives.emotion}</li>
                    </ul>

                    <div className="flex items-center justify-between mt-8 mb-4">
                      <h3 className="m-0">二、教学过程设计</h3>
                      {isEditing && (
                        <div className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          提示：您可以在编辑模式下修改环节内容并插入互动工具
                        </div>
                      )}
                    </div>
                    
                    {lessonPlan.steps.map((step, index) => (
                      <div key={step.id} className={`bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg my-4 ${isEditing ? 'ring-2 ring-orange-200' : ''}`}>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">环节名称</label>
                                <input 
                                  type="text" 
                                  value={step.title} 
                                  onChange={(e) => updateStep(index, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div className="w-24">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">时长(分钟)</label>
                                <input 
                                  type="number" 
                                  value={step.duration} 
                                  onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1 block">教师话术</label>
                              <textarea 
                                value={step.teacherScript} 
                                onChange={(e) => updateStep(index, 'teacherScript', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                              />
                            </div>

                            <div className="bg-white p-3 rounded-md border border-slate-200">
                              <label className="text-xs font-medium text-slate-500 mb-2 block">插入互动工具</label>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {availableTools.map(tool => (
                                  <button
                                    key={tool}
                                    onClick={() => addToolToStep(index, tool)}
                                    disabled={(step.tools || []).includes(tool)}
                                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    + {tool}
                                  </button>
                                ))}
                              </div>
                              {(step.tools && step.tools.length > 0) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                  <span className="text-xs text-slate-500 py-1">已添加：</span>
                                  {step.tools.map(tool => (
                                    <span key={tool} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                                      {tool}
                                      <button onClick={() => removeToolFromStep(index, tool)} className="hover:text-red-500 ml-1">×</button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-orange-800 mt-0 flex justify-between">
                              <span>环节{index + 1}：{step.title} ({step.duration}分钟)</span>
                              <span className="text-sm font-normal bg-orange-100 px-2 py-1 rounded">类型：{step.type}</span>
                            </h4>
                            <p className="mb-2"><strong>教师话术：</strong>“{step.teacherScript}”</p>
                            
                            {step.tools && step.tools.length > 0 && (
                              <div className="mb-3 flex gap-2">
                                {step.tools.map(tool => (
                                  <span key={tool} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium border border-emerald-200">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {step.aiTips && step.aiTips.length > 0 && (
                              <div className="mb-2">
                                <strong>AI 提示：</strong>
                                <ul className="mt-1 mb-0 text-sm text-slate-600">
                                  {step.aiTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                              </div>
                            )}

                            {step.resourceIds && step.resourceIds.length > 0 && (
                              <div className="mt-3 p-2 bg-white rounded border border-orange-100 text-sm flex flex-col gap-2">
                                {step.resourceIds.map(resId => {
                                  const res = mockResources[resId];
                                  if (!res) return null;
                                  return (
                                    <div key={resId} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs">已关联资源</span>
                                        <span className="font-medium text-slate-700">{res.title} ({res.type})</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setPreviewResource(res);
                                          bringToFront('preview');
                                        }}
                                        className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
                                      >
                                        <Eye className="w-3 h-3" /> 预览
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-red-500">
                  生成失败，请重试。
                </div>
              )}
            </div>
          </>
        ) : (
          /* Courseware Stage */
          <div className={isEditorFullscreen ? "fixed inset-0 z-[100] bg-slate-50 p-6 flex gap-6" : "flex-1 flex gap-6"}>
            {/* Slides List Sidebar */}
            <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">课件大纲</h3>
                <span className="text-xs text-slate-500">{slides.length} 页</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {slides.map((slide, index) => (
                  <div 
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${activeSlideIndex === index ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
                  >
                    <div className="text-xs text-slate-500 mb-1">第 {index + 1} 页</div>
                    <div className="font-medium text-sm text-slate-800 truncate">{slide.title}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      {slide.type === 'game' && <Gamepad2 className="w-3 h-3 text-emerald-500" />}
                      {slide.type === 'resource' && <PlayCircle className="w-3 h-3 text-amber-500" />}
                      {slide.type === 'text' && <Presentation className="w-3 h-3 text-slate-400" />}
                      {slide.type === 'game' ? '互动游戏' : slide.type === 'resource' ? '多媒体资源' : '文本内容'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Slide Editor */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Slide Preview Area */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">课件预览与编辑</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const newSlides = [...slides];
                        newSlides.splice(activeSlideIndex + 1, 0, {
                          id: `slide-new-${Date.now()}`,
                          title: '新幻灯片',
                          content: '在此输入内容...',
                          type: 'text',
                          notes: ''
                        });
                        setSlides(newSlides);
                        setActiveSlideIndex(activeSlideIndex + 1);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      新建页
                    </button>
                    <button 
                      onClick={() => {
                        if (slides.length > 1) {
                          const newSlides = [...slides];
                          newSlides.splice(activeSlideIndex, 1);
                          setSlides(newSlides);
                          setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
                        }
                      }}
                      disabled={slides.length <= 1}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      删除页
                    </button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button 
                      onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      {isEditorFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      {isEditorFullscreen ? '退出全屏' : '全屏编辑'}
                    </button>
                    <button 
                      onClick={handleStartClass}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      开始课堂演示
                    </button>
                  </div>
                </div>

                {/* WPS-like Toolbar */}
                <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto text-sm text-slate-600 shrink-0">
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><TypeIcon className="w-4 h-4" /> 文本</button>
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><ImageIcon className="w-4 h-4" /> 图片</button>
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><Shapes className="w-4 h-4" /> 形状</button>
                  <div className="w-px h-4 bg-slate-300 mx-2"></div>
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><MousePointerClick className="w-4 h-4" /> 交互设置</button>
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><Wand2 className="w-4 h-4" /> 动画</button>
                  <div className="w-px h-4 bg-slate-300 mx-2"></div>
                  <button className="px-3 py-1.5 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"><LayoutTemplate className="w-4 h-4" /> 换版式</button>
                </div>
                
                <div className="flex-1 bg-slate-100 p-4 md:p-8 flex items-center justify-center overflow-auto">
                  {/* Aspect Ratio 16:9 Slide Container */}
                  <div 
                    className="w-full aspect-video bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col relative overflow-hidden shrink-0 @container"
                    style={{ 
                      maxHeight: isEditorFullscreen ? 'calc(100vh - 320px)' : 'calc(100vh - 450px)',
                      maxWidth: isEditorFullscreen ? 'calc((100vh - 320px) * 16 / 9)' : 'calc((100vh - 450px) * 16 / 9)'
                    }}
                  >
                    {slides[activeSlideIndex] && (
                      <>
                        <div className="p-[clamp(1rem,4cqw,2rem)] flex-1 flex flex-col group min-h-0">
                          <input 
                            type="text"
                            value={slides[activeSlideIndex].title}
                            onChange={(e) => {
                              const newSlides = [...slides];
                              newSlides[activeSlideIndex].title = e.target.value;
                              setSlides(newSlides);
                            }}
                            className="text-[clamp(1.5rem,4cqw,3rem)] font-bold text-slate-800 mb-[clamp(0.5rem,3cqw,1.5rem)] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded px-2 -ml-2 hover:bg-slate-50 transition-colors shrink-0"
                          />
                          
                          {slides[activeSlideIndex].type === 'game' ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200 relative min-h-0">
                              <Gamepad2 className="w-[clamp(3rem,8cqw,5rem)] h-[clamp(3rem,8cqw,5rem)] text-emerald-400 mb-4 shrink-0" />
                              <h2 className="text-[clamp(1.25rem,3cqw,2.5rem)] font-bold text-emerald-700 mb-2 truncate w-full text-center px-4">{slides[activeSlideIndex].gameType}</h2>
                              <p className="text-[clamp(0.875rem,2cqw,1.5rem)] text-emerald-600 shrink-0">课堂互动环节</p>
                              <button className="mt-[clamp(1rem,3cqw,1.5rem)] px-[clamp(1rem,3cqw,1.5rem)] py-[clamp(0.5rem,1.5cqw,0.75rem)] bg-emerald-500 text-white rounded-full font-bold shadow-md hover:bg-emerald-600 transition-transform hover:scale-105 shrink-0 text-[clamp(0.875rem,2cqw,1.25rem)]">
                                点击开始互动
                              </button>
                            </div>
                          ) : slides[activeSlideIndex].type === 'resource' ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-amber-50 rounded-xl border-2 border-dashed border-amber-200 relative min-h-0">
                              <PlayCircle className="w-[clamp(3rem,8cqw,5rem)] h-[clamp(3rem,8cqw,5rem)] text-amber-400 mb-4 shrink-0" />
                              <h2 className="text-[clamp(1.125rem,2.5cqw,2rem)] font-bold text-amber-700 mb-2 truncate w-full text-center px-4">多媒体资源展示</h2>
                              <p className="text-[clamp(0.875rem,2cqw,1.5rem)] text-amber-600 text-center max-w-md overflow-y-auto px-4">{slides[activeSlideIndex].content}</p>
                            </div>
                          ) : (
                            <textarea 
                              value={slides[activeSlideIndex].content}
                              onChange={(e) => {
                                const newSlides = [...slides];
                                newSlides[activeSlideIndex].content = e.target.value;
                                setSlides(newSlides);
                              }}
                              className="flex-1 text-[clamp(1rem,2.5cqw,2rem)] text-slate-700 leading-relaxed whitespace-pre-wrap bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded px-2 -ml-2 resize-none hover:bg-slate-50 transition-colors overflow-y-auto min-h-0"
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Panel: Tools & Notes */}
              <div className="h-48 bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
                <div className="w-1/3 border-r border-slate-200 p-4 flex flex-col">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-500" />
                    插入互动游戏
                  </h4>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {availableGames.map(game => (
                        <button
                          key={game}
                          onClick={() => addGameToSlide(game)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <Gamepad2 className="w-3 h-3" />
                          {game}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4">
                      提示：点击上方游戏即可在当前幻灯片后插入一个新的互动游戏环节。
                    </p>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <h4 className="font-bold text-slate-800 mb-2">演讲者备注 (教案提示)</h4>
                  <textarea 
                    className="flex-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    value={slides[activeSlideIndex]?.notes || ''}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[activeSlideIndex].notes = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="在此输入演讲备注..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource Preview Modal */}
      {previewResource && (
        <div 
          onClick={() => bringToFront('preview')}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          style={{ zIndex: zIndices.preview }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" />
                资源预览
              </h3>
              <button onClick={() => setPreviewResource(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[300px]">
              {previewResource.type === 'video' ? (
                <div className="w-full max-w-lg aspect-video bg-slate-800 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                  <PlayCircle className="w-16 h-16 text-white/80" />
                  <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-orange-500"></div>
                  </div>
                </div>
              ) : previewResource.type === 'image' ? (
                <div className="w-full max-w-lg aspect-video bg-slate-200 rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                  <ImageIcon className="w-16 h-16 text-slate-400" />
                </div>
              ) : previewResource.type === 'interactive' ? (
                <div className="w-full max-w-lg aspect-video bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                  <Gamepad2 className="w-16 h-16 text-emerald-300 mb-4" />
                  <span className="text-emerald-600 font-medium">互动组件预览区</span>
                </div>
              ) : (
                <div className="w-full max-w-lg aspect-video bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                  <FileText className="w-16 h-16 text-blue-200 mb-4" />
                  <span className="text-slate-500 font-medium">{previewResource.format} 文档</span>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-white">
              <h4 className="text-xl font-bold text-slate-800 mb-2">{previewResource.title}</h4>
              <p className="text-slate-600 mb-4">{previewResource.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded">格式: {previewResource.format || '未知'}</span>
                <span className="bg-slate-100 px-2 py-1 rounded">大小: {previewResource.size || '未知'}</span>
                <span className="bg-slate-100 px-2 py-1 rounded uppercase">类型: {previewResource.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Courseware Config Modal */}
      {showCoursewareConfig && (
        <div 
          onClick={() => bringToFront('config')}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          style={{ zIndex: zIndices.config }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-orange-500" />
                智能课件生成配置
              </h3>
              <button onClick={() => setShowCoursewareConfig(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">PPT 风格</label>
                <select value={cwStyle} onChange={(e) => setCwStyle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>卡通可爱</option>
                  <option>简约现代</option>
                  <option>科技未来</option>
                  <option>中国风</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">预计页数</label>
                <select value={cwPages} onChange={(e) => setCwPages(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>5-10页 (简短)</option>
                  <option>10-15页 (标准)</option>
                  <option>15-20页 (详细)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">参考模板</label>
                <select value={cwTemplate} onChange={(e) => setCwTemplate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>默认模板</option>
                  <option>人教版官方模板</option>
                  <option>名师公开课模板</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowCoursewareConfig(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmGenerateCourseware}
                disabled={isGeneratingCourseware}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isGeneratingCourseware ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGeneratingCourseware ? '正在生成...' : '开始生成课件'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Users, Timer, Volume2, Maximize2, Minimize2, ChevronRight, ChevronLeft, ArrowLeft, BookOpen, Clock, Calendar, X } from 'lucide-react';
import { LessonPlan } from './LessonPrep';
import { mockResources, textbooks } from '../data/mockData';

export default function ClassAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { lessonPlan?: LessonPlan, bookId?: string } | null;
  
  const [activeLesson, setActiveLesson] = useState<LessonPlan | null>(state?.lessonPlan || null);
  const [activeBookId, setActiveBookId] = useState<string | null>(state?.bookId || null);
  
  const steps = activeLesson?.steps || [
    { id: 1, title: '导入与前概念探查', duration: 8, type: '互动', teacherScript: '同学们，看大屏幕上的这张图，谁能用火眼金睛找一找，图里哪些是植物呀？', aiTips: ['一年级学生可能会把蝴蝶也当成植物，此时不要急于否定。', '引导他们观察“会不会动”，初步建立动植物的区别。'], resourceIds: [] },
    { id: 2, title: '核心探究：塑料花是植物吗', duration: 15, type: '探究', teacherScript: '小组分发材料，看一看、摸一摸、闻一闻，进行对比观察。', aiTips: ['重点引导学生讨论核心特征，从而引出本课重点概念。'], resourceIds: [] },
    { id: 3, title: '实践活动：种一棵植物', duration: 12, type: '实践', teacherScript: '大家一起来种一棵植物吧！', aiTips: ['注意安全'], resourceIds: [] },
    { id: 4, title: '总结与拓展', duration: 5, type: '总结', teacherScript: '回顾本课重点，发放课后拓展材料，家校共育。', aiTips: [], resourceIds: [] },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration * 60);

  // Interactive Tools State
  const [showRandomName, setShowRandomName] = useState(false);
  const [randomNameResult, setRandomNameResult] = useState<string | null>(null);
  const [isRollingName, setIsRollingName] = useState(false);

  const [showGroupTimer, setShowGroupTimer] = useState(false);
  const [groupTimeLeft, setGroupTimeLeft] = useState(0);
  const [isGroupTimerRunning, setIsGroupTimerRunning] = useState(false);
  const [groupTimerInput, setGroupTimerInput] = useState(3);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // z-index management for panels
  const [zIndices, setZIndices] = useState({
    randomName: 60,
    groupTimer: 61
  });

  const bringToFront = (panel: keyof typeof zIndices) => {
    setZIndices(prev => {
      const maxZ = Math.max(...(Object.values(prev) as number[]));
      return { ...prev, [panel]: maxZ + 1 };
    });
  };

  // Fullscreen Logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
        setIsFullscreen(true); // Fallback
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Random Name Logic
  const students = ['张伟', '王芳', '李娜', '刘洋', '陈杰', '杨梅', '黄勇', '赵强', '周敏', '吴军', '徐磊', '孙丽', '马超', '朱婷', '胡歌'];
  const startRandomName = () => {
    setIsRollingName(true);
    setRandomNameResult(null);
    let rolls = 0;
    const maxRolls = 20;
    const interval = setInterval(() => {
      setRandomNameResult(students[Math.floor(Math.random() * students.length)]);
      rolls++;
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRollingName(false);
      }
    }, 100);
  };

  // Group Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGroupTimerRunning && groupTimeLeft > 0) {
      timer = setInterval(() => {
        setGroupTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (groupTimeLeft === 0 && isGroupTimerRunning) {
      setIsGroupTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isGroupTimerRunning, groupTimeLeft]);

  const startGroupTimer = (minutes: number) => {
    setGroupTimeLeft(minutes * 60);
    setIsGroupTimerRunning(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeLeft(steps[currentStep + 1].duration * 60);
      setIsRunning(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setTimeLeft(steps[currentStep - 1].duration * 60);
      setIsRunning(false);
    }
  };

  const handleFinishClass = () => {
    navigate('/loop', { state: { lessonPlan: activeLesson || { steps }, bookId: activeBookId } });
  };

  if (!activeLesson) {
    const historicalLessons = [
      { id: '1', bookId: 'sci-1-1', title: '我们知道的植物', date: '今天 10:00', status: '待上课', duration: 40, cover: 'bg-emerald-100 text-emerald-600' },
      { id: '2', bookId: 'art-1-2', title: '民间玩具', date: '昨天 14:00', status: '已完成', duration: 40, cover: 'bg-orange-100 text-orange-600' },
      { id: '3', bookId: 'mus-1-1', title: '欢迎你', date: '2026-03-25', status: '已完成', duration: 35, cover: 'bg-cyan-100 text-cyan-600' },
    ];

    return (
      <div className="h-full flex flex-col p-8 bg-slate-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">我的课堂</h2>
            <p className="text-slate-500 mt-1">选择已备好的课件开始上课，或查看历史授课记录。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historicalLessons.map((lesson) => {
              const book = textbooks.find(b => b.id === lesson.bookId);
              return (
                <div key={lesson.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lesson.cover}`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lesson.status === '待上课' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{book?.subject}《{lesson.title}》</h3>
                    <p className="text-sm text-slate-500 mb-4">{book?.grade}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{lesson.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>预计 {lesson.duration} 分钟</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    {lesson.status === '待上课' ? (
                      <button 
                        onClick={() => {
                          setActiveLesson({ steps } as any);
                          setActiveBookId(lesson.bookId);
                        }}
                        className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" /> 开始上课
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setActiveLesson({ steps } as any);
                            setActiveBookId(lesson.bookId);
                          }}
                          className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" /> 再次上课
                        </button>
                        <button 
                          onClick={() => navigate('/loop')}
                          className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          查看复盘报告
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 p-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 h-screen w-screen' : 'h-full'}`}>
      {/* Top Bar: Timer & Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          {!isFullscreen && (
            <button 
              onClick={() => setActiveLesson(null)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="返回列表"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className={`text-center border-l border-slate-700 pl-8 ${!isFullscreen ? '' : 'border-l-0 pl-0'}`}>
            <div className="text-slate-400 text-sm font-medium mb-1">当前环节倒计时</div>
            <div className={`text-5xl font-mono font-bold tracking-wider ${timeLeft < 60 ? 'text-red-400' : 'text-orange-400'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-l border-slate-700 pl-8">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(steps[currentStep].duration * 60); }}
              className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <Square className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Interactive Tools */}
          <button 
            onClick={() => {
              setShowRandomName(true);
              bringToFront('randomName');
            }} 
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">随机点名</span>
          </button>
          <button 
            onClick={() => {
              setShowGroupTimer(true);
              bringToFront('groupTimer');
            }} 
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Timer className="w-6 h-6" />
            <span className="text-xs font-medium">小组计时</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            <Volume2 className="w-6 h-6" />
            <span className="text-xs font-medium">噪音监测</span>
          </button>
          <div className="w-px h-10 bg-slate-700 mx-2"></div>
          <button onClick={toggleFullscreen} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            <span className="text-xs font-medium">{isFullscreen ? '退出全屏' : '全屏投影'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Step Navigation */}
        <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">教案流程</h3>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  index === currentStep 
                    ? 'border-orange-500 bg-orange-50' 
                    : index < currentStep 
                      ? 'border-slate-100 bg-slate-50 text-slate-400' 
                      : 'border-transparent hover:bg-slate-50'
                }`}
                onClick={() => {
                  setCurrentStep(index);
                  setTimeLeft(steps[index].duration * 60);
                  setIsRunning(false);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    index === currentStep ? 'bg-orange-200 text-orange-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.type}
                  </span>
                  <span className="text-xs font-medium">{step.duration} min</span>
                </div>
                <div className={`font-medium text-sm ${index === currentStep ? 'text-orange-900' : ''}`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Current Step Details (Teleprompter) */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold mb-4">
                当前环节：{steps[currentStep].title}
              </div>
              
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                    教师引导话术
                  </h4>
                  <p className="text-2xl leading-relaxed text-slate-700 font-medium">
                    “{steps[currentStep].teacherScript}”
                  </p>
                </div>

                {steps[currentStep].aiTips && steps[currentStep].aiTips.length > 0 && (
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h4 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                      教学提示 (AI 提取)
                    </h4>
                    <ul className="space-y-3 text-lg text-amber-900">
                      {steps[currentStep].aiTips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {steps[currentStep].tools && steps[currentStep].tools.length > 0 && (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <h4 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                      本环节互动工具
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {steps[currentStep].tools.map((tool, i) => (
                        <button key={i} className="flex items-center gap-2 px-4 py-3 bg-white border border-orange-200 rounded-xl shadow-sm hover:shadow-md hover:border-orange-400 transition-all text-orange-700 font-medium">
                          <span className="text-xl">{tool.split(' ')[0]}</span>
                          <span>{tool.split(' ')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {steps[currentStep].resourceIds && steps[currentStep].resourceIds.length > 0 && (
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h4 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                      本环节资源
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {steps[currentStep].resourceIds.map(resId => {
                        const res = mockResources[resId];
                        if (!res) return null;
                        return (
                          <div key={resId} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                              {res.type}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">{res.title}</div>
                              <div className="text-xs text-slate-500">{res.format} • {res.size}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> 上一环节
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button 
                onClick={handleFinishClass}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                下课并生成报告 <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                下一环节 <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Random Name Modal */}
      {showRandomName && (
        <div 
          onClick={() => bringToFront('randomName')}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          style={{ zIndex: zIndices.randomName }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">随机点名</h3>
              <button onClick={() => setShowRandomName(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-48 h-48 rounded-full bg-orange-50 border-8 border-orange-100 flex items-center justify-center mb-8 shadow-inner">
              <span className={`text-4xl font-bold ${isRollingName ? 'text-slate-400' : 'text-orange-600'}`}>
                {randomNameResult || '准备'}
              </span>
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={startRandomName}
                disabled={isRollingName}
                className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-md"
              >
                {isRollingName ? '抽取中...' : '开始抽取'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Timer Modal */}
      {showGroupTimer && (
        <div 
          onClick={() => bringToFront('groupTimer')}
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          style={{ zIndex: zIndices.groupTimer }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">小组计时</h3>
              <button onClick={() => setShowGroupTimer(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!isGroupTimerRunning && groupTimeLeft === 0 ? (
              <div className="w-full space-y-4 mb-8">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 3, 5, 10, 15, 20].map(min => (
                    <button
                      key={min}
                      onClick={() => setGroupTimerInput(min)}
                      className={`py-3 rounded-xl font-bold transition-colors ${
                        groupTimerInput === min 
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' 
                          : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      {min} 分钟
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 rounded-full border-8 border-orange-100 flex items-center justify-center mb-8 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="46" 
                    fill="none" 
                    stroke="#f97316" 
                    strokeWidth="8" 
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * groupTimeLeft) / (groupTimerInput * 60)}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <div className="text-6xl font-mono font-bold text-slate-800">
                  {formatTime(groupTimeLeft)}
                </div>
              </div>
            )}

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => {
                  setShowGroupTimer(false);
                  setIsGroupTimerRunning(false);
                  setGroupTimeLeft(0);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                重置
              </button>
              {!isGroupTimerRunning && groupTimeLeft === 0 ? (
                <button 
                  onClick={() => startGroupTimer(groupTimerInput)}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                >
                  开始计时
                </button>
              ) : (
                <button 
                  onClick={() => setIsGroupTimerRunning(!isGroupTimerRunning)}
                  className={`flex-1 py-3 text-white rounded-xl font-bold transition-colors ${
                    isGroupTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {isGroupTimerRunning ? '暂停' : '继续'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

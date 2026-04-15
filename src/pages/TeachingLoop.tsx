import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, FileEdit, RefreshCw, FolderOpen, Clock, ChevronRight } from 'lucide-react';
import { LessonPlan } from './LessonPrep';
import { textbooks } from '../data/mockData';

export default function TeachingLoop() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { lessonPlan?: LessonPlan, bookId?: string } | null;
  const lessonPlan = state?.lessonPlan;
  const bookId = state?.bookId || 'sci-1-1';
  const selectedBook = textbooks.find(b => b.id === bookId);

  const [activeTab, setActiveTab] = useState<'records' | 'resources'>('records');
  const [viewState, setViewState] = useState<'main' | 'report' | 'resource-detail'>('main');
  const [selectedResourceLib, setSelectedResourceLib] = useState<string | null>(null);

  const totalDuration = lessonPlan?.steps.reduce((acc, step) => acc + step.duration, 0) || 40;

  const handleRemix = () => {
    if (lessonPlan) {
      navigate('/prep', { state: { remixPlan: lessonPlan, bookId } });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {viewState !== 'main' && (
                <button onClick={() => setViewState('main')} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              )}
              <h2 className="text-2xl font-bold text-slate-800">
                {viewState === 'report' ? '课堂复盘报告' : viewState === 'resource-detail' ? selectedResourceLib : '教学复盘与资产'}
              </h2>
            </div>
            <p className="text-slate-500 mt-1">
              {viewState === 'report' ? '查看详细的课堂数据分析与AI建议。' : viewState === 'resource-detail' ? '管理您的专属教学资源。' : '查看历史授课复盘记录，管理沉淀的教学资源。'}
            </p>
          </div>
        </div>

        {viewState === 'main' && (
          <>
            {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('records')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'records' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Clock className="w-4 h-4" /> 历史复盘记录
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'resources' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <FolderOpen className="w-4 h-4" /> 我的教学资源
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="space-y-8">
            {/* Latest Class Report Card (Only show if navigated from ClassAssistant) */}
            {lessonPlan && (
              <div className="bg-white rounded-2xl border border-orange-200 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="bg-orange-50/50 border-b border-orange-100 p-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800">
                          最新待复盘：{selectedBook ? `${selectedBook.subject} ${selectedBook.grade}《${selectedBook.title}》` : '科学 一年级上册《我们知道的植物》'}
                        </h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">New</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">授课时间：刚刚 | 一年级(2)班</p>
                    </div>
                  </div>
                  <button onClick={handleRemix} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm">
                    <FileEdit className="w-4 h-4" />
                    开始智能复盘
                  </button>
                </div>

                <div className="p-6 grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> 时间执行偏差
                    </div>
                    <div className="text-2xl font-bold text-slate-800">+4 分钟</div>
                    <p className="text-xs text-slate-500">
                      {lessonPlan.steps.length > 1 ? `“${lessonPlan.steps[1].title}”环节超时，原计划${lessonPlan.steps[1].duration}分钟，实际${lessonPlan.steps[1].duration + 4}分钟。` : '“核心探究”环节超时，原计划15分钟，实际19分钟。'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> 互动工具使用
                    </div>
                    <div className="text-2xl font-bold text-slate-800">3 次</div>
                    <p className="text-xs text-slate-500">使用了随机点名(2次)和倒计时(1次)。</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> AI 优化建议
                    </div>
                    <div className="text-sm font-medium text-orange-600 mt-1">
                      建议在教案V2.0中，将{lessonPlan.steps.length > 1 ? `“${lessonPlan.steps[1].title}”` : '“塑料花对比”'}环节拆分为两个子任务，以控制时间。
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Assets Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">所有复盘记录</h3>
                <div className="flex gap-2">
                  <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-orange-500">
                    <option>全部学科</option>
                    <option>科学</option>
                    <option>美术</option>
                    <option>音乐</option>
                  </select>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                    <th className="p-4 font-medium">课程名称</th>
                    <th className="p-4 font-medium">授课班级</th>
                    <th className="p-4 font-medium">授课时间</th>
                    <th className="p-4 font-medium">迭代版本</th>
                    <th className="p-4 font-medium">复盘状态</th>
                    <th className="p-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">美术《天上云朵》</td>
                    <td className="p-4 text-slate-600">一年级(1)班</td>
                    <td className="p-4 text-slate-500">2026-03-25</td>
                    <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">V2.0</span></td>
                    <td className="p-4"><span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 已完成</span></td>
                    <td className="p-4 flex items-center gap-3">
                      <button onClick={() => setViewState('report')} className="text-orange-600 hover:underline">查看报告</button>
                      <button className="text-orange-600 hover:underline flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3" /> 再次迭代
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">音乐《欢迎你》</td>
                    <td className="p-4 text-slate-600">一年级(3)班</td>
                    <td className="p-4 text-slate-500">2026-03-24</td>
                    <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">V1.0</span></td>
                    <td className="p-4"><span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 已完成</span></td>
                    <td className="p-4 flex items-center gap-3">
                      <button onClick={() => setViewState('report')} className="text-orange-600 hover:underline">查看报告</button>
                      <button className="text-orange-600 hover:underline flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3" /> 迭代 V2.0
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">科学《观察一棵植物》</td>
                    <td className="p-4 text-slate-600">一年级(2)班</td>
                    <td className="p-4 text-slate-500">2026-03-20</td>
                    <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">V3.0</span></td>
                    <td className="p-4"><span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 已完成</span></td>
                    <td className="p-4 flex items-center gap-3">
                      <button onClick={() => setViewState('report')} className="text-orange-600 hover:underline">查看报告</button>
                      <button className="text-orange-600 hover:underline flex items-center gap-1 font-medium">
                        <RefreshCw className="w-3 h-3" /> 再次迭代
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => { setSelectedResourceLib('我的教案库'); setViewState('resource-detail'); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">我的教案库</h3>
              <p className="text-sm text-slate-500 mb-4">共 24 份教案</p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                查看详情 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
            <div onClick={() => { setSelectedResourceLib('我的课件库'); setViewState('resource-detail'); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">我的课件库</h3>
              <p className="text-sm text-slate-500 mb-4">共 18 份课件</p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                查看详情 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
            <div onClick={() => { setSelectedResourceLib('收藏的素材'); setViewState('resource-detail'); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">收藏的素材</h3>
              <p className="text-sm text-slate-500 mb-4">共 156 个素材</p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                查看详情 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {viewState === 'report' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">课堂综合分析报告</h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" /> 时间分配分析
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">导入环节 (计划 5分 / 实际 6分)</span>
                        <span className="text-amber-500 font-medium">+1分</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: '120%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">核心探究 (计划 20分 / 实际 25分)</span>
                        <span className="text-red-500 font-medium">+5分</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '125%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">总结与练习 (计划 15分 / 实际 10分)</span>
                        <span className="text-blue-500 font-medium">-5分</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '66%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> 课堂互动数据
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-sm text-slate-500 mb-1">提问次数</div>
                      <div className="text-2xl font-bold text-slate-800">12 <span className="text-sm font-normal text-emerald-500">↑ 20%</span></div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-sm text-slate-500 mb-1">工具使用</div>
                      <div className="text-2xl font-bold text-slate-800">3 <span className="text-sm font-normal text-slate-400">-</span></div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-sm text-slate-500 mb-1">学生参与度</div>
                      <div className="text-2xl font-bold text-slate-800">85% <span className="text-sm font-normal text-emerald-500">↑ 5%</span></div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-sm text-slate-500 mb-1">随堂测验正确率</div>
                      <div className="text-2xl font-bold text-slate-800">92% <span className="text-sm font-normal text-emerald-500">↑ 2%</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> AI 深度复盘建议
                </h4>
                <ul className="space-y-3 text-orange-700 text-sm leading-relaxed">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span><strong>时间管理：</strong> 核心探究环节超时较多，导致最后的总结练习时间被压缩。建议在下一次授课时，将探究任务拆分为两个更小的子任务，并严格使用倒计时工具控制每个子任务的时间。</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span><strong>互动工具：</strong> 本节课使用了随机点名，有效提升了学生的注意力。建议在导入环节可以增加一个简短的“投票”或“拼图游戏”，能更快地让学生进入学习状态。</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span><strong>教案迭代：</strong> 系统已根据本次授课数据，为您生成了优化后的教案 V2.0 草稿，重点调整了各环节的时间分配，您可以点击右上角的“再次迭代”进行查看和应用。</span>
                  </li>
                </ul>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleRemix} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                    应用建议，生成 V2.0 教案
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewState === 'resource-detail' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{selectedResourceLib} 列表</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="搜索资源..." className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-orange-500" />
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-medium">名称</th>
                  <th className="p-4 font-medium">学科/年级</th>
                  <th className="p-4 font-medium">更新时间</th>
                  <th className="p-4 font-medium">大小</th>
                  <th className="p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-slate-400" />
                      {selectedResourceLib === '我的教案库' ? `科学《植物的生长》教案 V${item}.0` : selectedResourceLib === '我的课件库' ? `科学《植物的生长》课件 V${item}.0` : `植物生长观察视频素材 ${item}`}
                    </td>
                    <td className="p-4 text-slate-600">科学 / 一年级</td>
                    <td className="p-4 text-slate-500">2026-03-{30 - item}</td>
                    <td className="p-4 text-slate-500">{item * 2.5} MB</td>
                    <td className="p-4 flex items-center gap-3">
                      <button className="text-orange-600 hover:underline">查看</button>
                      <button className="text-orange-600 hover:underline">下载</button>
                      <button className="text-red-600 hover:underline">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { BookOpen, PenTool, PlayCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [
  {
    title: '数字教材引擎',
    description: '智能解析教材内容，构建知识图谱，快速查阅数字资源。',
    icon: BookOpen,
    color: 'bg-orange-500',
    path: '/engine',
    stats: '已解析 4 本教材'
  },
  {
    title: '智能备课系统',
    description: '基于教材一键生成教案，支持个性化定制与资源调取。',
    icon: PenTool,
    color: 'bg-amber-500',
    path: '/prep',
    stats: '本周生成 3 份教案'
  },
  {
    title: '课堂助手',
    description: '教案流程辅助，提供互动工具箱，实时记录课堂数据。',
    icon: PlayCircle,
    color: 'bg-emerald-500',
    path: '/assistant',
    stats: '累计辅助 12 节课'
  },
  {
    title: '教学优化闭环',
    description: '自动生成反思报告，智能复盘引导，沉淀教学资产。',
    icon: RefreshCw,
    color: 'bg-amber-500',
    path: '/loop',
    stats: '待复盘 1 节课'
  }
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">早上好，李老师！</h2>
          <p className="text-slate-500">今天您有 2 节课需要准备，系统已为您备好相关资源。</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-500 mb-1">当前学期进度</div>
          <div className="text-3xl font-bold text-orange-600">第 4 周</div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link 
              key={mod.path} 
              to={mod.path}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${mod.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {mod.stats}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                {mod.title}
              </h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                {mod.description}
              </p>
              <div className="flex items-center text-sm font-medium text-orange-600 mt-auto">
                进入模块 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

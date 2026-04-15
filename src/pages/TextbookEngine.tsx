import { useState } from 'react';
import { Search, Book, FileText, Image, Video, ChevronRight, Layers } from 'lucide-react';

const textbooks = [
  { id: 1, subject: '科学', grade: '一年级上册', title: '植物', cover: 'bg-green-100 text-green-600' },
  { id: 2, subject: '美术', grade: '一年级下册', title: '民间玩具', cover: 'bg-orange-100 text-orange-600' },
  { id: 3, subject: '音乐', grade: '一年级上册', title: '欢迎你', cover: 'bg-pink-100 text-pink-600' },
  { id: 4, subject: '英语', grade: '一年级起点上册', title: 'Unit 1 School', cover: 'bg-amber-100 text-amber-600' },
];

export default function TextbookEngine() {
  const [activeBook, setActiveBook] = useState(textbooks[0]);

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel: Textbook Library */}
      <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索教材、知识点..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {textbooks.map(book => (
            <button
              key={book.id}
              onClick={() => setActiveBook(book)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                activeBook.id === book.id 
                  ? 'bg-orange-50 border border-orange-200 shadow-sm' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-12 h-16 rounded-md flex items-center justify-center font-bold text-lg ${book.cover}`}>
                {book.subject[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{book.subject}</div>
                <div className="text-xs text-slate-500 truncate">{book.grade}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Parser & Resources */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeBook.subject} · {activeBook.grade}</h2>
            <p className="text-sm text-slate-500 mt-1">当前解析单元：{activeBook.title}</p>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Layers className="w-4 h-4" />
            重新解析教材
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Knowledge Graph / Structure */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Book className="w-5 h-5 text-orange-500" />
                知识结构图谱
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-slate-700">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                    <div>
                      <span className="font-medium">核心概念：</span>
                      <span className="text-slate-600">植物是生物，有生命特征（根、茎、叶）</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                    <div>
                      <span className="font-medium">探究目标：</span>
                      <span className="text-slate-600">用多种感官观察，种植并记录生长过程</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                    <div>
                      <span className="font-medium">态度目标：</span>
                      <span className="text-slate-600">感受多样性，养成实事求是的记录习惯</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Extracted Resources */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                数字资源清单
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">植物与塑料花对比图</div>
                    <div className="text-xs text-slate-500">高清图片 · 2.4MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">种子发芽延时摄影</div>
                    <div className="text-xs text-slate-500">视频 · 15.8MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">致家长的一封信模板</div>
                    <div className="text-xs text-slate-500">Word 文档 · 12KB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

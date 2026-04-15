import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Heart, Clock, X } from 'lucide-react';
import { textbooks } from '../data/mockData';

const subjects = ['全部', '科学', '美术', '音乐', '英语'];
const grades = ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级'];
const terms = ['全部', '上册', '下册'];

const versionsMap: Record<string, string[]> = {
  '科学': ['大象版', '沪科版五四制', '教科版', '冀人版', '青岛版', '人教版', '苏教版', '湘科版', '粤教科技版'],
  '美术': ['北京版', '赣美版', '桂美版', '沪书画版', '冀美版', '辽海版鲁教版五四制', '岭南版', '人教版', '人美版', '苏少版', '湘美版', '浙美版'],
  '音乐': ['北京版', '鄂教版', '沪音版', '教科版', '接力版', '冀少版', '辽海版', '鲁教版五四制', '人教版', '人音版', '苏少版', '西师大(西南大学版)', '湘艺版', '粤教版(花城版)'],
  '英语': ['北京版', '北师大川教版', 'EEC版', '广州教科版', '冀教版', '接力版', '科普版', '鲁科版五四制', '辽师大', '闽教版', '清华版', '人教版', '精通版', '人教版pep', '人教版新起点', '人教大同版', '陕旅版', '外研社(含join in)', '湘鲁版', '湘少版', '粤教版', '译林版', '重庆版']
};

const allVersions = Array.from(new Set(Object.values(versionsMap).flat()));

export default function Library() {
  const [activeSubject, setActiveSubject] = useState('全部');
  const [activeGrade, setActiveGrade] = useState('全部');
  const [activeTerm, setActiveTerm] = useState('全部');
  const [activeVersion, setActiveVersion] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('library_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('library_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const itemsPerPage = 16;

  const currentVersions = ['全部', ...(activeSubject === '全部' ? allVersions : versionsMap[activeSubject])];

  const handleSubjectChange = (subject: string) => {
    setActiveSubject(subject);
    setActiveVersion('全部'); // Reset version when subject changes
    setCurrentPage(1);
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [bookId, ...prev];
      localStorage.setItem('library_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleBookClick = (bookId: string) => {
    setHistory(prev => {
      const newHistory = [bookId, ...prev.filter(id => id !== bookId)];
      localStorage.setItem('library_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('library_history');
    setShowClearConfirm(false);
  };

  const filteredBooks = useMemo(() => {
    return textbooks.filter(book => {
      if (activeSubject !== '全部' && book.subject !== activeSubject) return false;
      if (activeGrade !== '全部' && book.grade !== activeGrade) return false;
      if (activeTerm !== '全部' && book.term !== activeTerm) return false;
      if (activeVersion !== '全部' && book.version !== activeVersion) return false;
      return true;
    });
  }, [activeSubject, activeGrade, activeTerm, activeVersion]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderFilterRow = (label: string, options: string[], activeValue: string, onChange: (val: string) => void) => (
    <div className="flex items-start gap-4 mb-4 last:mb-0">
      <span className="text-sm font-bold text-slate-700 whitespace-nowrap py-1.5">{label}：</span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => { onChange(option); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeValue === option 
                ? 'bg-orange-100 text-orange-700 font-medium' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const getSelectedFiltersText = () => {
    const filters = [];
    if (activeSubject !== '全部') filters.push(activeSubject);
    if (activeVersion !== '全部') filters.push(activeVersion);
    if (activeGrade !== '全部') filters.push(activeGrade);
    if (activeTerm !== '全部') filters.push(activeTerm);
    return filters.length > 0 ? `已选：${filters.join(' / ')}` : '全部教材';
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              数字教材库
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => { setShowFavorites(!showFavorites); setShowHistory(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showFavorites ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'}`}
              >
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">我的收藏</span>
              </button>
              
              {showFavorites && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">我的收藏</h3>
                    <button onClick={() => setShowFavorites(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {favorites.length > 0 ? (
                      favorites.map(id => {
                        const book = textbooks.find(b => b.id === id);
                        if (!book) return null;
                        return (
                          <Link key={id} to={`/reader/${id}`} onClick={() => handleBookClick(id)} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden shrink-0">
                              {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : <div className={`w-full h-full ${book.coverColor}`}></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 truncate">{book.subject} {book.grade}{book.term}</h4>
                              <p className="text-xs text-slate-500 truncate">{book.version}</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-sm">暂无收藏</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => { setShowHistory(!showHistory); setShowFavorites(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showHistory ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'}`}
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">浏览历史</span>
              </button>
              
              {showHistory && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">浏览历史</h3>
                    <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <button 
                          onClick={() => setShowClearConfirm(true)} 
                          className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                        >
                          清除记录
                        </button>
                      )}
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {history.length > 0 ? (
                      history.map(id => {
                        const book = textbooks.find(b => b.id === id);
                        if (!book) return null;
                        return (
                          <Link key={id} to={`/reader/${id}`} onClick={() => handleBookClick(id)} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden shrink-0">
                              {book.coverImage ? <img src={book.coverImage} className="w-full h-full object-cover" /> : <div className={`w-full h-full ${book.coverColor}`}></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 truncate">{book.subject} {book.grade}{book.term}</h4>
                              <p className="text-xs text-slate-500 truncate">{book.version}</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-sm">暂无浏览记录</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200"></div>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索教材名称..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden transition-all duration-300">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{getSelectedFiltersText()}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              {isFiltersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          {isFiltersExpanded && (
            <div className="p-6 pt-2 border-t border-slate-100">
              {renderFilterRow('学科', subjects, activeSubject, handleSubjectChange)}
              {renderFilterRow('版本', currentVersions, activeVersion, setActiveVersion)}
              {renderFilterRow('年级', grades, activeGrade, setActiveGrade)}
              {renderFilterRow('册别', terms, activeTerm, setActiveTerm)}
            </div>
          )}
        </div>

        {/* Book Grid */}
        {paginatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
            {paginatedBooks.map(book => (
              <Link 
                key={book.id} 
                to={`/reader/${book.id}`}
                onClick={() => handleBookClick(book.id)}
                className="group flex flex-col"
              >
                {/* Book Cover */}
                <div className={`aspect-[3/4] rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 relative overflow-hidden ${book.coverImage ? 'bg-slate-100' : book.coverColor}`}>
                  
                  {/* Favorite Button */}
                  <div className={`absolute top-3 right-3 z-20 transition-opacity duration-200 ${favorites.includes(book.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(book.id); }}
                      className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-colors ${favorites.includes(book.id) ? 'bg-white text-red-500' : 'bg-black/20 text-white hover:bg-black/40'}`}
                      title={favorites.includes(book.id) ? '取消收藏' : '加入收藏'}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(book.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/10 to-transparent"></div>
                      <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black/5 to-transparent border-r border-black/5"></div>
                      
                      <div className="absolute top-4 left-4 text-xs font-bold opacity-70">{book.version}</div>
                      
                      <span className="text-6xl font-black opacity-20 mb-4">{book.coverText}</span>
                      <h3 className="text-xl font-bold text-center leading-tight z-10">{book.subject}</h3>
                      <p className="text-sm font-medium opacity-80 mt-2 z-10">{book.grade}{book.term}</p>
                    </>
                  )}
                  
                  <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-sm p-3 text-center border-t border-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-sm font-bold text-slate-800">进入阅读模式</span>
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors leading-snug">
                    {book.subject}{book.grade}{book.term}{book.version}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2">包含 12 个互动资源</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">没有找到符合条件的教材</h3>
            <p className="text-sm text-slate-400 mt-1">请尝试调整筛选条件</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 max-w-[90vw] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">清除浏览记录</h3>
            <p className="text-sm text-slate-600 mb-6">确定要清除所有浏览历史记录吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={clearHistory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                确定清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

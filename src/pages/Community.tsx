import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, Search, Filter, PlusCircle, BookOpen, PenTool, User, X, Download, UserPlus, UserMinus, Ban, ChevronLeft, Send, FileText } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  time: string;
  type: 'discussion' | 'resource' | 'lesson-plan';
  resourceName?: string;
  resourceSize?: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: '王老师',
    avatar: '王',
    title: '三年级科学《植物的生长》V2.0教案分享，加入了更多互动环节！',
    content: '上周用系统生成的教案上了一节课，发现学生对“光合作用”的理解还有些吃力。我在复盘后对教案进行了迭代，在核心探究环节加入了“随机点名”和“拼图游戏”工具，效果非常好！大家可以参考一下。',
    tags: ['科学', '三年级', '教案迭代', '互动工具'],
    likes: 45,
    comments: 12,
    time: '2小时前',
    type: 'lesson-plan',
    resourceName: '三年级科学《植物的生长》V2.0教案.pdf',
    resourceSize: '2.4 MB'
  },
  {
    id: '2',
    author: '李老师',
    avatar: '李',
    title: '求助：如何更好地利用数字教材中的音频资源进行英语听力训练？',
    content: '最近在备课四年级英语，发现数字教材里有很多优质的音频资源。想请教一下各位同仁，除了直接播放，大家还有什么创新的互动方式吗？',
    tags: ['英语', '四年级', '教学方法', '音频资源'],
    likes: 18,
    comments: 24,
    time: '5小时前',
    type: 'discussion'
  },
  {
    id: '3',
    author: '张老师',
    avatar: '张',
    title: '分享一个超好用的美术课导入小游戏',
    content: '今天尝试在美术课导入环节用了一个“猜画名”的小游戏，学生们的积极性瞬间被调动起来了。我已经把这个游戏作为互动工具保存到了我的备课库里，强烈推荐给大家。',
    tags: ['美术', '课堂互动', '游戏化教学'],
    likes: 89,
    comments: 36,
    time: '1天前',
    type: 'resource',
    resourceName: '猜画名互动游戏模板.zip',
    resourceSize: '15.8 MB'
  }
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<'all' | 'lesson-plan' | 'discussion' | 'resource'>('all');
  const [viewState, setViewState] = useState<'feed' | 'post-detail' | 'teacher-profile'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [commentText, setCommentText] = useState('');

  const filteredPosts = activeTab === 'all' ? mockPosts : mockPosts.filter(post => post.type === activeTab);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setViewState('post-detail');
  };

  const handleAvatarClick = (e: React.MouseEvent, author: string) => {
    e.stopPropagation();
    setSelectedTeacher(author);
    setViewState('teacher-profile');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              {viewState !== 'feed' && (
                <button onClick={() => setViewState('feed')} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-slate-800">
                {viewState === 'post-detail' ? '动态详情' : viewState === 'teacher-profile' ? `${selectedTeacher} 的主页` : '交流探讨'}
              </h1>
            </div>
            <p className="text-slate-500 mt-1">
              {viewState === 'post-detail' ? '查看动态详情与评论。' : viewState === 'teacher-profile' ? '查看该教师发布的动态与资源。' : '与全国教师分享备课经验，探讨教学方法，共建优质资源库。'}
            </p>
          </div>
          {viewState === 'feed' && (
            <button onClick={() => setIsPublishModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium">
              <PlusCircle className="w-5 h-5" />
              发布动态
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex gap-8">
          
          {/* Left Column: Posts */}
          <div className="flex-1 flex flex-col gap-6">
            {viewState === 'feed' && (
              <>
                {/* Filters */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex gap-1">
                {[
                  { id: 'all', label: '全部动态' },
                  { id: 'lesson-plan', label: '教案分享' },
                  { id: 'discussion', label: '教学探讨' },
                  { id: 'resource', label: '资源推荐' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-orange-50 text-orange-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索话题或教案..." 
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>
            </div>

            {/* Post List */}
            <div className="flex flex-col gap-4">
              {filteredPosts.map(post => (
                <div key={post.id} onClick={() => handlePostClick(post)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div 
                      onClick={(e) => handleAvatarClick(e, post.author)}
                      className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all"
                    >
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={(e) => handleAvatarClick(e, post.author)}
                            className="font-medium text-slate-900 hover:text-orange-600 cursor-pointer"
                          >
                            {post.author}
                          </span>
                          <span className="text-xs text-slate-400">{post.time}</span>
                        </div>
                        {post.type === 'lesson-plan' && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <PenTool className="w-3 h-3" />
                            教案分享
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mt-2 mb-1">{post.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-6 text-slate-500 pt-4 border-t border-slate-100">
                        <button className="flex items-center gap-1.5 hover:text-orange-600 transition-colors text-sm" onClick={(e) => e.stopPropagation()}>
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-orange-600 transition-colors text-sm" onClick={(e) => e.stopPropagation()}>
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-orange-600 transition-colors text-sm ml-auto" onClick={(e) => e.stopPropagation()}>
                          <Share2 className="w-4 h-4" />
                          <span>分享</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}

            {viewState === 'post-detail' && selectedPost && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div 
                      onClick={(e) => handleAvatarClick(e, selectedPost.author)}
                      className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-lg shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all"
                    >
                      {selectedPost.avatar}
                    </div>
                    <div>
                      <div 
                        onClick={(e) => handleAvatarClick(e, selectedPost.author)}
                        className="font-bold text-slate-900 text-lg hover:text-orange-600 cursor-pointer"
                      >
                        {selectedPost.author}
                      </div>
                      <div className="text-sm text-slate-500">{selectedPost.time}</div>
                    </div>
                    <div className="ml-auto">
                      <button className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors flex items-center gap-1">
                        <UserPlus className="w-4 h-4" /> 关注
                      </button>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">{selectedPost.title}</h2>
                  <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap text-lg">{selectedPost.content}</p>
                  
                  {selectedPost.resourceName && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-orange-500 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{selectedPost.resourceName}</div>
                          <div className="text-xs text-slate-500">{selectedPost.resourceSize}</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> 下载资源
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-6">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-8 text-slate-500 py-4 border-y border-slate-100">
                    <button className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium">{selectedPost.likes} 赞</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">{selectedPost.comments} 评论</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-orange-600 transition-colors ml-auto">
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">分享</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-slate-50 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">全部评论 ({selectedPost.comments})</h3>
                  
                  <div className="flex gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      我
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="写下你的评论..." 
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                        <Send className="w-4 h-4" /> 发送
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {['陈', '刘', '周'][i-1]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">{['陈老师', '刘老师', '周老师'][i-1]}</span>
                            <span className="text-xs text-slate-400">2小时前</span>
                          </div>
                          <p className="text-slate-700 text-sm">
                            {['太棒了，正好需要这个资源！', '感谢分享，这个互动环节设计得很巧妙。', '借用了您的教案，学生们非常喜欢！'][i-1]}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <button className="flex items-center gap-1 hover:text-orange-600"><ThumbsUp className="w-3 h-3" /> 赞</button>
                            <button className="hover:text-orange-600">回复</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewState === 'teacher-profile' && selectedTeacher && (
              <div className="flex flex-col gap-6 animate-in fade-in">
                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-100 to-amber-50"></div>
                  <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-3xl shrink-0 z-10 border-4 border-white shadow-md">
                    {selectedTeacher[0]}
                  </div>
                  <div className="flex-1 z-10 pt-8">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedTeacher}</h2>
                    <p className="text-slate-500 mt-1">小学科学高级教师 | 致力于趣味科学教育</p>
                    <div className="flex items-center gap-6 mt-4 text-sm">
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-lg">128</span><span className="text-slate-500">关注</span></div>
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-lg">3.2k</span><span className="text-slate-500">粉丝</span></div>
                      <div className="flex flex-col"><span className="font-bold text-slate-800 text-lg">45</span><span className="text-slate-500">动态</span></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 z-10 pt-8">
                    <button 
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        isFollowing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {isFollowing ? <><UserMinus className="w-4 h-4" /> 取消关注</> : <><UserPlus className="w-4 h-4" /> 关注</>}
                    </button>
                    <button 
                      onClick={() => setIsBlocked(!isBlocked)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        isBlocked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Ban className="w-4 h-4" /> {isBlocked ? '解除拉黑' : '拉黑'}
                    </button>
                  </div>
                </div>

                {/* Teacher's Posts */}
                <h3 className="font-bold text-slate-800 text-lg mt-2">TA 的动态</h3>
                <div className="flex flex-col gap-4">
                  {mockPosts.filter(p => p.author === selectedTeacher).length > 0 ? (
                    mockPosts.filter(p => p.author === selectedTeacher).map(post => (
                      <div key={post.id} onClick={() => handlePostClick(post)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400">{post.time}</span>
                              {post.type === 'lesson-plan' && (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                  <PenTool className="w-3 h-3" /> 教案分享
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{post.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-6 text-slate-500 pt-4 border-t border-slate-100">
                              <span className="flex items-center gap-1.5 text-sm"><ThumbsUp className="w-4 h-4" /> {post.likes}</span>
                              <span className="flex items-center gap-1.5 text-sm"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
                      该教师暂未发布任何动态。
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-80 shrink-0 flex flex-col gap-6">
            {/* Hot Topics */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600" />
                热门话题
              </h3>
              <div className="flex flex-col gap-3">
                {['# 如何利用AI优化教案', '# 课堂互动小游戏推荐', '# 科学实验课安全指南', '# 英语口语训练技巧'].map((topic, i) => (
                  <a key={i} href="#" className="text-sm text-slate-600 hover:text-orange-600 transition-colors line-clamp-1">
                    {topic}
                  </a>
                ))}
              </div>
            </div>

            {/* Active Teachers */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                活跃教师
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { name: '赵老师', subject: '科学', avatar: '赵' },
                  { name: '陈老师', subject: '英语', avatar: '陈' },
                  { name: '刘老师', subject: '美术', avatar: '刘' }
                ].map((teacher, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      onClick={(e) => handleAvatarClick(e, teacher.name)}
                      className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm cursor-pointer hover:ring-2 hover:ring-amber-300"
                    >
                      {teacher.avatar}
                    </div>
                    <div>
                      <div 
                        onClick={(e) => handleAvatarClick(e, teacher.name)}
                        className="text-sm font-medium text-slate-800 cursor-pointer hover:text-orange-600"
                      >
                        {teacher.name}
                      </div>
                      <div className="text-xs text-slate-500">{teacher.subject}教研组</div>
                    </div>
                    <button className="ml-auto text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors">
                      关注
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">发布动态</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="添加标题..." 
                  className="w-full text-lg font-bold text-slate-800 placeholder:text-slate-400 border-none outline-none focus:ring-0 px-0"
                />
              </div>
              <div>
                <textarea 
                  placeholder="分享你的教学经验、教案或提出问题..." 
                  className="w-full h-32 text-slate-700 placeholder:text-slate-400 border-none outline-none focus:ring-0 px-0 resize-none"
                ></textarea>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                  <span className="text-orange-500">#</span> 添加话题
                </button>
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" /> 附件资源
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-orange-600 focus:ring-orange-500" defaultChecked />
                    允许他人下载附件
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsPublishModalOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                    取消
                  </button>
                  <button onClick={() => setIsPublishModalOpen(false)} className="px-5 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm">
                    发布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

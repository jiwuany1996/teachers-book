export type ResourceType = 'V' | 'A' | 'P' | 'i' | 'D' | 'video' | 'image' | 'qa' | 'doc' | 'interactive' | 'ppt' | 'audio';

export interface Resource {
  id: string;
  type: ResourceType;
  subType?: string;
  title: string;
  size?: string;
  format?: string;
  description?: string;
}

export interface Textbook {
  id: string;
  subject: string;
  grade: string;
  term: string;
  version: string;
  title: string;
  coverColor: string;
  coverText: string;
  coverImage?: string;
}

export const textbooks: Textbook[] = [
  { id: 'sci-1-1', subject: '科学', grade: '一年级', term: '上册', version: '湘科版', title: '走进科学', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科', coverImage: '/assets/科学一年级上册教材封面.png' },
  { id: 'sci-1-2', subject: '科学', grade: '一年级', term: '下册', version: '大象版', title: '奇妙的世界', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'sci-2-1', subject: '科学', grade: '二年级', term: '上册', version: '人教版', title: '身边的科学', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'sci-3-1', subject: '科学', grade: '三年级', term: '上册', version: '苏教版', title: '物质与变化', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'sci-4-1', subject: '科学', grade: '四年级', term: '上册', version: '青岛版', title: '生命科学', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'sci-5-1', subject: '科学', grade: '五年级', term: '上册', version: '教科版', title: '地球与宇宙', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'sci-6-1', subject: '科学', grade: '六年级', term: '上册', version: '冀人版', title: '技术与工程', coverColor: 'bg-emerald-100 text-emerald-700', coverText: '科' },
  { id: 'art-1-1', subject: '美术', grade: '一年级', term: '上册', version: '人美版', title: '色彩的魅力', coverColor: 'bg-orange-100 text-orange-700', coverText: '美' },
  { id: 'art-1-2', subject: '美术', grade: '一年级', term: '下册', version: '人教版', title: '民间玩具', coverColor: 'bg-orange-100 text-orange-700', coverText: '美' },
  { id: 'art-2-1', subject: '美术', grade: '二年级', term: '上册', version: '湘美版', title: '线条的舞蹈', coverColor: 'bg-orange-100 text-orange-700', coverText: '美' },
  { id: 'art-3-1', subject: '美术', grade: '三年级', term: '上册', version: '苏少版', title: '造型与表现', coverColor: 'bg-orange-100 text-orange-700', coverText: '美' },
  { id: 'art-4-1', subject: '美术', grade: '四年级', term: '上册', version: '岭南版', title: '设计与应用', coverColor: 'bg-orange-100 text-orange-700', coverText: '美' },
  { id: 'mus-1-1', subject: '音乐', grade: '一年级', term: '上册', version: '人音版', title: '欢迎你', coverColor: 'bg-pink-100 text-pink-700', coverText: '音' },
  { id: 'mus-1-2', subject: '音乐', grade: '一年级', term: '下册', version: '人教版', title: '春天的歌', coverColor: 'bg-pink-100 text-pink-700', coverText: '音' },
  { id: 'mus-2-1', subject: '音乐', grade: '二年级', term: '上册', version: '苏少版', title: '快乐的节奏', coverColor: 'bg-pink-100 text-pink-700', coverText: '音' },
  { id: 'mus-3-1', subject: '音乐', grade: '三年级', term: '上册', version: '湘艺版', title: '美妙的旋律', coverColor: 'bg-pink-100 text-pink-700', coverText: '音' },
  { id: 'mus-4-1', subject: '音乐', grade: '四年级', term: '上册', version: '花城版', title: '音乐与生活', coverColor: 'bg-pink-100 text-pink-700', coverText: '音' },
  { id: 'eng-1-1', subject: '英语', grade: '一年级', term: '上册', version: '人教版pep', title: 'Unit 1 School', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-1-2', subject: '英语', grade: '一年级', term: '下册', version: '外研社', title: 'Unit 1 Colors', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-2-1', subject: '英语', grade: '二年级', term: '上册', version: '译林版', title: 'Unit 1 Animals', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-3-1', subject: '英语', grade: '三年级', term: '上册', version: '冀教版', title: 'Unit 1 Food', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-4-1', subject: '英语', grade: '四年级', term: '上册', version: '湘少版', title: 'Unit 1 Family', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-5-1', subject: '英语', grade: '五年级', term: '上册', version: '广州教科版', title: 'Unit 1 Hobbies', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
  { id: 'eng-6-1', subject: '英语', grade: '六年级', term: '上册', version: '清华版', title: 'Unit 1 Travel', coverColor: 'bg-amber-100 text-amber-700', coverText: '英' },
];

export const mockResources: Record<string, Resource> = {
  // 科学资源 - 封面
  'sci-res-1': { id: 'sci-res-1', type: 'V', subType: 'V-1', title: '全册教材解读视频', size: '120MB', format: 'MP4', description: '名师团队录制的全册整体教学解读。' },
  'sci-res-2': { id: 'sci-res-2', type: 'i', subType: 'i-1', title: '全册知识点自测', size: '15MB', format: 'H5', description: '在线互动测评练习。' },
  'sci-res-3': { id: 'sci-res-3', type: 'P', subType: 'P-1', title: '全册思维导图', size: '45MB', format: 'PPTX', description: '包含完整教学环节的思维导图。' },
  'sci-res-4': { id: 'sci-res-4', type: 'D', subType: 'D-1', title: '教师教学手册', size: '200KB', format: 'PDF', description: '供教师打印使用的教学手册。' },
  
  // 科学资源 - 走进科学 (第1课)
  'sci-res-5': { id: 'sci-res-5', type: 'V', subType: 'V-2', title: '情景导入视频', size: '35MB', format: 'MP4', description: '走进科学单元情景导入。' },
  'sci-res-6': { id: 'sci-res-6', type: 'A', subType: 'A-1', title: '启发式提问指南', format: '问答指南', description: '提供教师引导话术，组织学生讨论。' },
  'sci-res-7': { id: 'sci-res-7', type: 'P', subType: 'P-2', title: '结构图谱', size: '5MB', format: 'JPG', description: '单元知识结构图谱。' },
  'sci-res-8': { id: 'sci-res-8', type: 'V', subType: 'V-3', title: '原理动画演示', size: '25MB', format: 'MP4', description: '科学原理动画演示视频。' },
  
  // 科学资源 - 科学家的故事 (第2课)
  'sci-res-9': { id: 'sci-res-9', type: 'V', subType: 'V-4', title: '法布尔与《昆虫记》', size: '45MB', format: 'MP4', description: '拓展视频：介绍法国科学家法布尔长期观察昆虫的故事。' },
  'sci-res-10': { id: 'sci-res-10', type: 'D', subType: 'D-2', title: '科学家生平资料', size: '1.2MB', format: 'PDF', description: '图文并茂的科学家生平介绍。' },
  
  // 科学资源 - 从观察开始 (第3课)
  'sci-res-11': { id: 'sci-res-11', type: 'i', subType: 'i-2', title: '观察西瓜互动实验', size: '8MB', format: 'H5', description: '科学实验活动：引导学生在线上模拟使用不同感官观察西瓜的特征。' },
  'sci-res-12': { id: 'sci-res-12', type: 'P', subType: 'P-3', title: '《从观察开始》精美课件', size: '45MB', format: 'PPTX', description: '包含完整教学环节的授课课件，支持一键切换授课模式。' },
  'sci-res-13': { id: 'sci-res-13', type: 'D', subType: 'D-3', title: '学生观察记录单', size: '200KB', format: 'PDF', description: '供学生打印使用的五官观察西瓜记录表。' },
  
  // 科学资源 - 保护感官 (第4课)
  'sci-res-14': { id: 'sci-res-14', type: 'V', subType: 'V-2', title: '保护眼睛科普动画', size: '18MB', format: 'MP4', description: '生动有趣的科普动画，教育学生如何保护视力。' },
  'sci-res-15': { id: 'sci-res-15', type: 'A', subType: 'A-2', title: '保护感官情境讨论', format: '问答指南', description: '提供教师引导话术，组织学生讨论日常生活中保护眼、耳、鼻的正确做法。' },
  'sci-res-16': { id: 'sci-res-16', type: 'P', subType: 'P-4', title: '教学评价表模板', size: '2MB', format: 'DOCX', description: '提供标准的课堂教学评价表模板，方便教师打印使用。' },
  'sci-res-17': { id: 'sci-res-17', type: 'D', subType: 'D-2', title: '优秀教学案例分享', size: '5MB', format: 'PDF', description: '精选全国优秀教师的《走进科学》教学案例。' },
  'sci-res-18': { id: 'sci-res-18', type: 'V', subType: 'V-4', title: '昆虫记AIGC拓展讲解', size: '20MB', format: 'MP4', description: '使用AIGC技术生成的《昆虫记》趣味讲解视频。' },
  
  // 教师用书专属精细化段落资源
  'sci-res-19': { id: 'sci-res-19', type: 'A', subType: 'A-3', title: '探究活动引导（一）', format: '教学参考', description: '针对科学探究环节1的详细引导话术与注意事项。' },
  'sci-res-20': { id: 'sci-res-20', type: 'A', subType: 'A-3', title: '探究活动引导（二）', format: '教学参考', description: '针对科学探究环节2的详细引导话术与学生常见问题预案。' },
  'sci-res-21': { id: 'sci-res-21', type: 'P', subType: 'P-1', title: '保护方法思维导图', size: '2MB', format: 'PPTX', description: '梳理各种感官保护方法的结构化图表，辅助教师板书。' },
  'sci-res-22': { id: 'sci-res-22', type: 'A', subType: 'A-1', title: '教学反思提问', format: '问答指南', description: '课后反思环节的启发式问题库，帮助评估教学效果。' },
  'sci-res-23': { id: 'sci-res-23', type: 'D', subType: 'D-2', title: '拓展迁移案例', size: '3MB', format: 'PDF', description: '提供更多生活中的感官保护案例，供课堂拓展使用。' },
  'sci-res-24': { id: 'sci-res-24', type: 'D', subType: 'D-1', title: '单元教学目标解析', size: '1MB', format: 'PDF', description: '深度解析本单元的核心素养与教学目标。' },
  'sci-res-25': { id: 'sci-res-25', type: 'A', subType: 'A-2', title: '学情分析指南', format: '教学参考', description: '分析一年级学生的认知特点及可能遇到的学习障碍。' },
  'sci-res-26': { id: 'sci-res-26', type: 'P', subType: 'P-3', title: '教学重难点图解', size: '4MB', format: 'JPG', description: '直观展示本课的教学重点与难点突破策略。' },
  'sci-res-27': { id: 'sci-res-27', type: 'V', subType: 'V-3', title: '课堂实录片段', size: '45MB', format: 'MP4', description: '优秀教师教授此环节的真实课堂录像片段。' },
};

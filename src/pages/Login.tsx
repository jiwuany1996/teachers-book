import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, User, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      onLogin();
      navigate('/');
    } else {
      setError('用户名或密码错误。请使用 Demo 账号。');
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative overflow-hidden flex-col justify-center gap-16 p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/30 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            数字化教师用书<br />（e堂好课版）
          </h1>
          <p className="text-orange-100 text-lg max-w-md leading-relaxed">
            基于教材内容的智能备课、课堂互动与教学复盘，打造一站式教学闭环，让备课更轻松，让课堂更精彩。
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-orange-200" />
            <h3 className="text-white font-bold">全新智能备课体验</h3>
          </div>
          <p className="text-orange-100 text-sm leading-relaxed">
            "通过AI辅助，将教材内容快速转化为结构化教案与互动课件，极大地提升了我的备课效率。"
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">欢迎回来</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">用户名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all bg-slate-50 focus:bg-white font-medium text-slate-900"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 block">密码</label>
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">忘记密码？</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all bg-slate-50 focus:bg-white font-medium text-slate-900"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-orange-500/20 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all active:scale-[0.98]"
            >
              登录
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-12 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()}湖南教育音像电子出版社
          </div>
        </div>
      </div>
    </div>
  );
}

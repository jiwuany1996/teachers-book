import React from 'react';
import { ShoppingBag, Search, Filter, ShoppingCart, Star } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    name: '小学科学实验器材套装（全套）',
    description: '包含1-6年级所有必做实验所需器材，符合国家课程标准。',
    price: '¥ 1,299.00',
    sales: 1250,
    rating: 4.9,
    image: 'https://picsum.photos/seed/sci-kit/400/300'
  },
  {
    id: '2',
    name: '智能互动教学一体机 (86寸)',
    description: '支持多点触控，内置e堂好课专属教学系统，海量资源一键调用。',
    price: '¥ 15,800.00',
    sales: 320,
    rating: 4.8,
    image: 'https://picsum.photos/seed/smart-board/400/300'
  },
  {
    id: '3',
    name: '《植物的生长》配套标本盒',
    description: '精选12种常见植物种子及生长阶段标本，直观展示植物生命周期。',
    price: '¥ 199.00',
    sales: 890,
    rating: 4.9,
    image: 'https://picsum.photos/seed/plant-specimen/400/300'
  },
  {
    id: '4',
    name: '教师专属护嗓扩音器',
    description: '轻巧便携，长续航，有效保护教师嗓子，覆盖全班无死角。',
    price: '¥ 259.00',
    sales: 2100,
    rating: 4.7,
    image: 'https://picsum.photos/seed/speaker/400/300'
  }
];

export default function Store() {
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
              官方采购
            </h1>
            <p className="text-slate-500 mt-1">
              精选优质教学教具、智能硬件，一站式满足学校及教师采购需求。
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索商品..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Categories */}
          <div className="flex items-center gap-2 mb-8">
            {['全部商品', '实验器材', '智能硬件', '教辅资料', '教师用品'].map((category, i) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  i === 0 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
            <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> 筛选
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="px-4 py-2 bg-white text-slate-800 rounded-full font-medium text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                      查看详情
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-orange-600">{product.price}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {product.rating} ({product.sales}售)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, ThumbsUp, Award, TrendingUp, Plus, Search, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';

interface Post {
  id: string;
  author: string;
  avatar: string;
  language: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: '英语达人小王',
    avatar: '👨‍💻',
    language: 'english',
    title: '如何在一个月内提升英语口语？',
    content: '分享我的英语口语提升经验：每天坚持跟读TED演讲，模仿母语者的发音和语调。坚持30天后，口语水平明显提升！',
    likes: 128,
    comments: 45,
    time: '2小时前',
  },
  {
    id: '2',
    author: '日语学习者',
    avatar: '👩‍🎨',
    language: 'japanese',
    title: 'JLPT N2备考心得',
    content: '备考N2的同学们注意了！词汇量是关键，我每天背诵50个单词，配合做真题，两个月顺利通过！',
    likes: 89,
    comments: 32,
    time: '5小时前',
  },
  {
    id: '3',
    author: '韩语追剧党',
    avatar: '🧑‍🎤',
    language: 'korean',
    title: '通过看韩剧学习韩语的经验',
    content: '看韩剧真的对学习韩语很有帮助！推荐《请回答1988》，剧中对话简单实用，非常适合初学者。',
    likes: 156,
    comments: 67,
    time: '1天前',
  },
];

const topLearners = [
  { name: '学习小能手', points: 12580, avatar: '🏆', streak: 45 },
  { name: '单词王', points: 11200, avatar: '📚', streak: 38 },
  { name: '口语达人', points: 9800, avatar: '🎤', streak: 30 },
  { name: '听力专家', points: 8900, avatar: '🎧', streak: 28 },
  { name: '语法大师', points: 8200, avatar: '✍️', streak: 25 },
];

const languageGroups = [
  { id: 'english', name: '英语学习圈', members: '12.5K', icon: '🇬🇧' },
  { id: 'japanese', name: '日语交流圈', members: '8.3K', icon: '🇯🇵' },
  { id: 'korean', name: '韩语爱好者', members: '6.8K', icon: '🇰🇷' },
];

export const Community = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', language: 'english' });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: user?.nickname || '匿名用户',
      avatar: '👤',
      language: newPost.language,
      title: newPost.title,
      content: newPost.content,
      likes: 0,
      comments: 0,
      time: '刚刚',
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', language: 'english' });
    setShowCreatePost(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">学习社区</h1>
            <p className="text-primary-100">与志同道合的学习者一起进步</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="text-accent-500" />
                    热门话题
                  </h2>
                  <Button onClick={() => setShowCreatePost(true)} size="sm">
                    <Plus size={16} />
                    发帖
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索帖子..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-500 focus:outline-none"
                  />
                </div>

                {showCreatePost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-6 bg-gradient-to-br from-accent-50 to-orange-50 rounded-xl"
                  >
                    <h3 className="font-bold text-gray-800 mb-4">发布新帖子</h3>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="标题"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none mb-3"
                    />
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="分享你的学习心得..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none h-32 resize-none mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={newPost.language}
                        onChange={(e) => setNewPost({ ...newPost, language: e.target.value })}
                        className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-accent-500 focus:outline-none"
                      >
                        <option value="english">🇬🇧 英语</option>
                        <option value="japanese">🇯🇵 日语</option>
                        <option value="korean">🇰🇷 韩语</option>
                      </select>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setShowCreatePost(false)}>
                          取消
                        </Button>
                        <Button size="sm" onClick={handleCreatePost}>
                          发布
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {posts
                    .filter(post =>
                      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      post.content.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card hover={true}>
                          <CardContent className="py-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-2xl">
                                {post.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-800">{post.author}</span>
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {post.language === 'english' ? '🇬🇧' : post.language === 'japanese' ? '🇯🇵' : '🇰🇷'}
                                  </span>
                                  <span className="text-sm text-gray-500">{post.time}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
                                <p className="text-gray-600 mb-4">{post.content}</p>
                                <div className="flex items-center gap-6">
                                  <button
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-accent-500 transition-colors"
                                  >
                                    <ThumbsUp size={18} />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-accent-500 transition-colors">
                                    <MessageCircle size={18} />
                                    <span>{post.comments}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Globe className="text-accent-500" />
                  学习小组
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languageGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{group.name}</p>
                          <p className="text-sm text-gray-500">{group.members} 成员</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-accent-500" />
                  学习排行榜
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLearners.map((learner, index) => (
                    <motion.div
                      key={learner.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                          index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-200' : index === 2 ? 'bg-orange-100' : 'bg-gray-50'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{learner.name}</p>
                          <p className="text-sm text-gray-500">🔥 {learner.streak}天连续</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent-500">{learner.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">积分</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <CardContent className="py-6 text-center">
                <Users size={48} className="mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">邀请好友</h3>
                <p className="text-white/90 mb-4">邀请好友加入，一起学习更高效</p>
                <Button className="bg-white !text-purple-600 hover:!bg-gray-100">
                  立即邀请
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

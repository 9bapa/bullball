'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, TrendingUp, Award, Star, Zap, Flame } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  points: number
  badges: string[]
  trend: 'up' | 'down' | 'same'
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface SocialProofProps {
  className?: string
}

export function Leaderboard({ className = '' }: SocialProofProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      username: 'DogeKing420',
      points: 15420,
      badges: ['Early Adopter', 'Top Buyer', 'Shiba Fan'],
      trend: 'up'
    },
    {
      rank: 2,
      username: 'PepeMaster69',
      points: 12350,
      badges: ['Whale Alert', 'Trendsetter'],
      trend: 'up'
    },
    {
      rank: 3,
      username: 'BonkBandit',
      points: 10100,
      badges: ['Quick Flipper'],
      trend: 'down'
    },
    {
      rank: 4,
      username: 'ShibaHodler',
      points: 8900,
      badges: ['Diamond Hands'],
      trend: 'same'
    },
    {
      rank: 5,
      username: 'MemeLord',
      points: 7500,
      badges: ['Collector'],
      trend: 'up'
    }
  ])

  const [livePurchases, setLivePurchases] = useState<Array<{user: string, item: string, time: string}>>([
    { user: 'AnonY', item: 'Doge Hoodie', time: '2 sec ago' },
    { user: 'CryptoFan99', item: 'Pepe T-Shirt', time: '15 sec ago' },
    { user: 'MemeWhale', item: 'Bonk Cap', time: '1 min ago' },
    { user: 'DogeToTheMoon', item: 'Shiba Socks', time: '2 min ago' },
    { user: 'PepeArmy', item: 'Meme Bundle', time: '3 min ago' }
  ])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new random purchase
      const items = ['Doge Mug', 'Pepe Poster', 'Shiba Sticker', 'Bonk Phone Case']
      const users = ['MemeLover' + Math.floor(Math.random() * 999), 'CryptoKing' + Math.floor(Math.random() * 999), 'WhaleAlert']
      
      const newPurchase = {
        user: users[Math.floor(Math.random() * users.length)],
        item: items[Math.floor(Math.random() * items.length)],
        time: 'Just now'
      }
      
      setLivePurchases(prev => [newPurchase, ...prev.slice(0, 4)])
      
      // Update leaderboard occasionally
      if (Math.random() > 0.7) {
        setLeaderboard(prev => {
          const updated = [...prev]
          const randomIndex = Math.floor(Math.random() * updated.length)
          updated[randomIndex].points += Math.floor(Math.random() * 100)
          updated[randomIndex].trend = Math.random() > 0.5 ? 'up' : 'down'
          return updated.sort((a, b) => b.points - a.points)
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Live Purchases */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Live Purchases</h3>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            {livePurchases.map((purchase, index) => (
              <div 
                key={`${purchase.user}-${index}`}
                className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-lg animate-slideIn hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-102 active:scale-98"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-rainbow rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">{purchase.user}</div>
                    <div className="text-gray-400 text-sm">bought {purchase.item}</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">{purchase.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Collectors Leaderboard */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Top Collectors</h3>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.username} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-black font-bold text-sm">
                  {entry.rank === 1 ? '👑' : entry.rank}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{entry.username}</span>
                    {entry.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {entry.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-meme-yellow font-mono font-bold">{entry.points.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm">pts</span>
                    {entry.badges.map((badge, index) => (
                      <Badge key={badge} className="badge-meme text-xs ml-1">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AchievementsProps {
  userAchievements?: Achievement[]
}

export function Achievements({ userAchievements = [] }: AchievementsProps) {
  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_purchase',
      name: 'First Purchase',
      description: 'Complete your first meme coin purchase',
      icon: '🛒',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'collector_5',
      name: 'Collector',
      description: 'Purchase 5 different meme coin items',
      icon: '🎯',
      unlocked: true,
      progress: 5,
      maxProgress: 5
    },
    {
      id: 'whale_alert',
      name: 'Whale Alert',
      description: 'Spend over 1 SOL in one transaction',
      icon: '🐋',
      unlocked: false,
      progress: 0.7,
      maxProgress: 1
    },
    {
      id: 'diamond_hands',
      name: 'Diamond Hands',
      description: 'Hold items in cart for 24 hours without checkout',
      icon: '💎',
      unlocked: false,
      progress: 0.3,
      maxProgress: 1
    },
    {
      id: 'trendsetter',
      name: 'Trendsetter',
      description: 'Purchase a trending item within 1 hour of it dropping',
      icon: '🔥',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'meme_lord',
      name: 'Meme Lord',
      description: 'Collect items from 10 different meme coin categories',
      icon: '👑',
      unlocked: false,
      progress: 6,
      maxProgress: 10
    }
  ])

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Achievements</h3>
          <div className="text-sm text-gray-400">Level 5 Meme Collector</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`
                p-4 rounded-lg border transition-all duration-300
                ${achievement.unlocked 
                  ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/50' 
                  : 'bg-slate-800/30 border-slate-700/50'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`
                  text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}
                `}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {achievement.description}
                  </div>
                </div>
                {achievement.unlocked && (
                  <Star className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              
              {/* Progress Bar */}
              {!achievement.unlocked && (
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickStatsProps {
  totalPurchases: number
  cartValue: number
  streakDays: number
  memberSince: string
}

export function QuickStats({ totalPurchases, cartValue, streakDays, memberSince }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass-card p-4 text-center hover-lift">
        <div className="text-3xl font-black text-meme-purple mb-1">{totalPurchases}</div>
        <div className="text-sm text-gray-400">Total Purchases</div>
      </div>
      
      <div className="glass-card p-4 text-center hover-lift">
        <div className="text-3xl font-black text-meme-green mb-1">${cartValue}</div>
        <div className="text-sm text-gray-400">Cart Value</div>
      </div>
      
      <div className="glass-card p-4 text-center hover-lift">
        <div className="text-3xl font-black text-meme-orange mb-1">{streakDays}</div>
        <div className="text-sm text-gray-400">Day Streak</div>
      </div>
      
      <div className="glass-card p-4 text-center hover-lift">
        <div className="text-lg font-black text-meme-blue mb-1">{memberSince}</div>
        <div className="text-sm text-gray-400">Member Since</div>
      </div>
    </div>
  )
}
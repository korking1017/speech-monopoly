export interface Question {
  id: string
  type: 'tongue_twister' | 'recitation' | 'impromptu' | 'imitation' | 'teamwork'
  title: string
  content: string
  difficulty: 1 | 2 | 3
  timeLimit: number
  tags: string[]
}

export const questionBank: Record<string, Question[]> = {
  tongue_twister: [
    {
      id: 'tt1', type: 'tongue_twister', title: '四是四，十是十', difficulty: 1, timeLimit: 25,
      content: '四是四，十是十，十四是十四，四十是四十。不要把十四说成四十，也不要把四十说成十四。',
      tags: ['发音', '数字']
    },
    {
      id: 'tt2', type: 'tongue_twister', title: '吃葡萄不吐葡萄皮', difficulty: 1, timeLimit: 20,
      content: '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。',
      tags: ['发音', '唇齿音']
    },
    {
      id: 'tt3', type: 'tongue_twister', title: '板凳与扁担', difficulty: 2, timeLimit: 25,
      content: '板凳宽，扁担长，扁担想绑在板凳上，板凳不让扁担绑在板凳上，扁担偏要绑在板凳上。',
      tags: ['发音', '节奏']
    },
    {
      id: 'tt4', type: 'tongue_twister', title: '画凤凰', difficulty: 2, timeLimit: 25,
      content: '粉红墙上画凤凰，凤凰画在粉红墙。红凤凰，粉凤凰，红粉凤凰，花凤凰。',
      tags: ['发音', 'f/h音']
    },
    {
      id: 'tt5', type: 'tongue_twister', title: '牛郎恋刘娘', difficulty: 3, timeLimit: 30,
      content: '牛郎恋刘娘，刘娘念牛郎。牛郎牛年恋刘娘，刘娘年年念牛郎。郎恋娘来娘念郎，念娘恋郎念郎恋娘。',
      tags: ['发音', 'n/l音']
    },
    {
      id: 'tt6', type: 'tongue_twister', title: '八百标兵', difficulty: 1, timeLimit: 20,
      content: '八百标兵奔北坡，炮兵并排北边跑。炮兵怕把标兵碰，标兵怕碰炮兵炮。',
      tags: ['发音', 'b/p音']
    },
    {
      id: 'tt7', type: 'tongue_twister', title: '灰化肥', difficulty: 3, timeLimit: 30,
      content: '黑化肥发灰，灰化肥发黑。黑化肥发灰会挥发，灰化肥挥发会发黑。',
      tags: ['发音', 'h/f音']
    },
    {
      id: 'tt8', type: 'tongue_twister', title: '山前山后', difficulty: 2, timeLimit: 25,
      content: '山前有四十四棵死涩柿子树，山后有四十四只石狮子。山前的四十四棵死涩柿子树涩死了山后的四十四只石狮子。',
      tags: ['发音', 's/sh音']
    },
  ],
  recitation: [
    {
      id: 'rc1', type: 'recitation', title: '春晓', difficulty: 1, timeLimit: 20,
      content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      tags: ['古诗', '春天']
    },
    {
      id: 'rc2', type: 'recitation', title: '静夜思', difficulty: 1, timeLimit: 20,
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
      tags: ['古诗', '月亮']
    },
    {
      id: 'rc3', type: 'recitation', title: '小小的船', difficulty: 1, timeLimit: 25,
      content: '弯弯的月儿小小的船，小小的船儿两头尖。我在小小的船里坐，只看见闪闪的星星蓝蓝的天。',
      tags: ['儿歌', '想象']
    },
    {
      id: 'rc4', type: 'recitation', title: '乡愁（节选）', difficulty: 3, timeLimit: 35,
      content: '小时候，乡愁是一枚小小的邮票，我在这头，母亲在那头。长大后，乡愁是一张窄窄的船票，我在这头，新娘在那头。',
      tags: ['现代诗', '情感']
    },
    {
      id: 'rc5', type: 'recitation', title: '再别康桥（节选）', difficulty: 3, timeLimit: 35,
      content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。那河畔的金柳，是夕阳中的新娘；波光里的艳影，在我的心头荡漾。',
      tags: ['现代诗', '意境']
    },
  ],
  impromptu: [
    {
      id: 'im1', type: 'impromptu', title: '我的梦想', difficulty: 1, timeLimit: 30,
      content: '请用30秒时间，告诉大家你长大后想做什么，为什么？',
      tags: ['梦想', '自我表达']
    },
    {
      id: 'im2', type: 'impromptu', title: '最好的朋友', difficulty: 1, timeLimit: 30,
      content: '请介绍一下你最好的朋友，说说你们之间最开心的一件事。',
      tags: ['友谊', '叙事']
    },
    {
      id: 'im3', type: 'impromptu', title: '假如我会飞', difficulty: 2, timeLimit: 35,
      content: '假如你有一双翅膀，你会飞到哪里去？会做些什么？请展开想象讲述。',
      tags: ['想象', '创意']
    },
    {
      id: 'im4', type: 'impromptu', title: '最喜欢的季节', difficulty: 2, timeLimit: 30,
      content: '你最喜欢哪个季节？请说出三个理由，并描述这个季节里你最喜欢做的事情。',
      tags: ['描述', '理由']
    },
    {
      id: 'im5', type: 'impromptu', title: '如果我是老师', difficulty: 3, timeLimit: 40,
      content: '如果你当一天老师，你会怎么给同学们上课？请设计一节有趣的课。',
      tags: ['想象', '设计']
    },
  ],
  imitation: [
    {
      id: 'mt1', type: 'imitation', title: '天气预报员', difficulty: 1, timeLimit: 25,
      content: '请模仿天气预报员播报天气："明天白天多云转晴，最高气温25度，适合户外活动。"',
      tags: ['模仿', '职业']
    },
    {
      id: 'mt2', type: 'imitation', title: '小动物的声音', difficulty: 1, timeLimit: 20,
      content: '请模仿三种小动物的叫声和动作，让大家猜猜是什么动物。',
      tags: ['模仿', '动物']
    },
    {
      id: 'mt3', type: 'imitation', title: '动画角色', difficulty: 2, timeLimit: 30,
      content: '请模仿你最喜欢的动画片角色，说一句经典台词，并做出标志性动作。',
      tags: ['模仿', '表演']
    },
    {
      id: 'mt4', type: 'imitation', title: '不同情绪朗诵', difficulty: 3, timeLimit: 35,
      content: '请用开心、悲伤、愤怒三种不同的情绪分别朗诵："今天天气真好啊！"',
      tags: ['模仿', '情绪']
    },
  ],
  teamwork: [
    {
      id: 'tw1', type: 'teamwork', title: '故事接龙', difficulty: 2, timeLimit: 60,
      content: '团队成员依次每人说一句话，共同完成一个完整的故事。开头：在一个阳光明媚的早晨...',
      tags: ['协作', '创意']
    },
    {
      id: 'tw2', type: 'teamwork', title: '齐声朗诵', difficulty: 1, timeLimit: 30,
      content: '全队一起朗诵《静夜思》，要求声音整齐、有感情。',
      tags: ['协作', '朗诵']
    },
  ],
}

export function getRandomQuestion(type: string, difficulty: number, excludeIds: string[] = []): Question | null {
  const pool = questionBank[type]
  if (!pool || pool.length === 0) return null
  
  const available = pool.filter(q => 
    q.difficulty <= difficulty && !excludeIds.includes(q.id)
  )
  
  if (available.length === 0) {
    const allAvailable = pool.filter(q => !excludeIds.includes(q.id))
    if (allAvailable.length === 0) return pool[0]
    return allAvailable[Math.floor(Math.random() * allAvailable.length)]
  }
  
  return available[Math.floor(Math.random() * available.length)]
}

export const CELL_TYPE_TO_QUESTION: Record<string, string> = {
  'tongue_twister': 'tongue_twister',
  'recitation': 'recitation',
  'impromptu': 'impromptu',
  'imitation': 'imitation',
  'teamwork': 'teamwork',
}

export const CARD_POOL = [
  { id: 'card_skip', name: '免答卡', description: '跳过当前任务，不得分也不扣分', icon: '🛡️', rarity: 'common' },
  { id: 'card_double', name: '双倍积分卡', description: '本次任务得分翻倍', icon: '✨', rarity: 'rare' },
  { id: 'card_assign', name: '指定卡', description: '指定其他同学代替完成任务', icon: '👉', rarity: 'rare' },
  { id: 'card_steal', name: '偷分卡', description: '从指定同学那里偷取2分', icon: '🕵️', rarity: 'epic' },
  { id: 'card_shield', name: '护盾卡', description: '抵御一次负面效果', icon: '🔰', rarity: 'common' },
  { id: 'card_swap', name: '交换卡', description: '与指定同学交换位置', icon: '🔄', rarity: 'epic' },
  { id: 'card_lucky', name: '幸运卡', description: '随机获得2-5分', icon: '🍀', rarity: 'common' },
]
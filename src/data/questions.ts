export interface Question {
  id: string
  type: 'tongue_twister' | 'recitation' | 'impromptu' | 'imitation' | 'teamwork' | 'team_battle' | 'team_cooperate'
  title: string
  content: string
  difficulty: 1 | 2 | 3
  timeLimit: number
  tags: string[]
}

export const defaultQuestions: Record<string, Question[]> = {
  tongue_twister: [
    { id: 'tt1', type: 'tongue_twister', title: '四是四，十是十', difficulty: 1, timeLimit: 25, content: '四是四，十是十，十四是十四，四十是四十。不要把十四说成四十，也不要把四十说成十四。', tags: ['发音', '数字'] },
    { id: 'tt2', type: 'tongue_twister', title: '吃葡萄不吐葡萄皮', difficulty: 1, timeLimit: 20, content: '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。', tags: ['发音', '唇齿音'] },
    { id: 'tt3', type: 'tongue_twister', title: '板凳与扁担', difficulty: 2, timeLimit: 25, content: '板凳宽，扁担长，扁担想绑在板凳上，板凳不让扁担绑在板凳上，扁担偏要绑在板凳上。', tags: ['发音', '节奏'] },
    { id: 'tt4', type: 'tongue_twister', title: '画凤凰', difficulty: 2, timeLimit: 25, content: '粉红墙上画凤凰，凤凰画在粉红墙。红凤凰，粉凤凰，红粉凤凰，花凤凰。', tags: ['发音', 'f/h音'] },
    { id: 'tt5', type: 'tongue_twister', title: '牛郎恋刘娘', difficulty: 3, timeLimit: 30, content: '牛郎恋刘娘，刘娘念牛郎。牛郎牛年恋刘娘，刘娘年年念牛郎。郎恋娘来娘念郎，念娘恋郎念郎恋娘。', tags: ['发音', 'n/l音'] },
    { id: 'tt6', type: 'tongue_twister', title: '八百标兵', difficulty: 1, timeLimit: 20, content: '八百标兵奔北坡，炮兵并排北边跑。炮兵怕把标兵碰，标兵怕碰炮兵炮。', tags: ['发音', 'b/p音'] },
    { id: 'tt7', type: 'tongue_twister', title: '灰化肥', difficulty: 3, timeLimit: 30, content: '黑化肥发灰，灰化肥发黑。黑化肥发灰会挥发，灰化肥挥发会发黑。', tags: ['发音', 'h/f音'] },
    { id: 'tt8', type: 'tongue_twister', title: '山前山后', difficulty: 2, timeLimit: 25, content: '山前有四十四棵死涩柿子树，山后有四十四只石狮子。', tags: ['发音', 's/sh音'] },
  ],
  recitation: [
    { id: 'rc1', type: 'recitation', title: '春晓', difficulty: 1, timeLimit: 20, content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', tags: ['古诗', '春天'] },
    { id: 'rc2', type: 'recitation', title: '静夜思', difficulty: 1, timeLimit: 20, content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。', tags: ['古诗', '月亮'] },
    { id: 'rc3', type: 'recitation', title: '小小的船', difficulty: 1, timeLimit: 25, content: '弯弯的月儿小小的船，小小的船儿两头尖。我在小小的船里坐，只看见闪闪的星星蓝蓝的天。', tags: ['儿歌', '想象'] },
    { id: 'rc4', type: 'recitation', title: '乡愁（节选）', difficulty: 3, timeLimit: 35, content: '小时候，乡愁是一枚小小的邮票，我在这头，母亲在那头。', tags: ['现代诗', '情感'] },
    { id: 'rc5', type: 'recitation', title: '再别康桥（节选）', difficulty: 3, timeLimit: 35, content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。', tags: ['现代诗', '意境'] },
  ],
  impromptu: [
    { id: 'im1', type: 'impromptu', title: '我的梦想', difficulty: 1, timeLimit: 30, content: '请用30秒时间，告诉大家你长大后想做什么，为什么？', tags: ['梦想', '自我表达'] },
    { id: 'im2', type: 'impromptu', title: '最好的朋友', difficulty: 1, timeLimit: 30, content: '请介绍一下你最好的朋友，说说你们之间最开心的一件事。', tags: ['友谊', '叙事'] },
    { id: 'im3', type: 'impromptu', title: '假如我会飞', difficulty: 2, timeLimit: 35, content: '假如你有一双翅膀，你会飞到哪里去？会做些什么？请展开想象讲述。', tags: ['想象', '创意'] },
    { id: 'im4', type: 'impromptu', title: '最喜欢的季节', difficulty: 2, timeLimit: 30, content: '你最喜欢哪个季节？请说出三个理由，并描述这个季节里你最喜欢做的事情。', tags: ['描述', '理由'] },
    { id: 'im5', type: 'impromptu', title: '如果我是老师', difficulty: 3, timeLimit: 40, content: '如果你当一天老师，你会怎么给同学们上课？请设计一节有趣的课。', tags: ['想象', '设计'] },
  ],
  imitation: [
    { id: 'mt1', type: 'imitation', title: '天气预报员', difficulty: 1, timeLimit: 25, content: '请模仿天气预报员播报天气："明天白天多云转晴，最高气温25度，适合户外活动。"', tags: ['模仿', '职业'] },
    { id: 'mt2', type: 'imitation', title: '小动物的声音', difficulty: 1, timeLimit: 20, content: '请模仿三种小动物的叫声和动作，让大家猜猜是什么动物。', tags: ['模仿', '动物'] },
    { id: 'mt3', type: 'imitation', title: '动画角色', difficulty: 2, timeLimit: 30, content: '请模仿你最喜欢的动画片角色，说一句经典台词，并做出标志性动作。', tags: ['模仿', '表演'] },
    { id: 'mt4', type: 'imitation', title: '不同情绪朗诵', difficulty: 3, timeLimit: 35, content: '请用开心、悲伤、愤怒三种不同的情绪分别朗诵："今天天气真好啊！"', tags: ['模仿', '情绪'] },
  ],
  teamwork: [
    { id: 'tw1', type: 'teamwork', title: '故事接龙', difficulty: 2, timeLimit: 60, content: '团队成员依次每人说一句话，共同完成一个完整的故事。开头：在一个阳光明媚的早晨...', tags: ['协作', '创意'] },
    { id: 'tw2', type: 'teamwork', title: '齐声朗诵', difficulty: 1, timeLimit: 30, content: '全队一起朗诵《静夜思》，要求声音整齐、有感情。', tags: ['协作', '朗诵'] },
    { id: 'tw3', type: 'teamwork', title: '角色扮演对话', difficulty: 2, timeLimit: 60, content: '团队两人一组，分别扮演顾客和店员，进行一段关于买文具的对话。要求语气自然、有互动。', tags: ['协作', '对话'] },
    { id: 'tw4', type: 'teamwork', title: '声音接力', difficulty: 1, timeLimit: 40, content: '第一个人说一个词，第二个人重复并加一个词，依次接力，直到组成一个完整的句子。最后全队齐声朗诵。', tags: ['协作', '接力'] },
  ],
  team_battle: [
    { id: 'tb1', type: 'team_battle', title: '团队绕口令PK', difficulty: 2, timeLimit: 60, content: '两队各派一名代表进行绕口令对决！题目：四是四，十是十。由老师判定谁说得更快更准。', tags: ['对抗', '绕口令'] },
    { id: 'tb2', type: 'team_battle', title: '团队朗诵PK', difficulty: 2, timeLimit: 60, content: '两队分别齐声朗诵《春晓》，由老师评判哪队更整齐、更有感情。', tags: ['对抗', '朗诵'] },
    { id: 'tb3', type: 'team_battle', title: '即兴演讲对战', difficulty: 3, timeLimit: 90, content: '两队各派一名代表，就"为什么我的团队更棒"进行1分钟即兴演讲，老师评分定胜负。', tags: ['对抗', '即兴'] },
    { id: 'tb4', type: 'team_battle', title: '模仿秀对决', difficulty: 2, timeLimit: 60, content: '两队各选一名队员模仿一位名人，对方队伍猜是谁，猜对得分。', tags: ['对抗', '模仿'] },
    { id: 'tb5', type: 'team_battle', title: '声音气势对决', difficulty: 1, timeLimit: 40, content: '两队轮流用最大声音朗诵同一段话，分贝高者获胜！', tags: ['对抗', '气势'] },
    { id: 'tb6', type: 'team_battle', title: '创意广告PK', difficulty: 3, timeLimit: 120, content: '两队各用60秒为"口才大富翁"设计一段广告语并表演，老师评分。', tags: ['对抗', '创意'] },
  ],
  team_cooperate: [
    { id: 'tc1', type: 'team_cooperate', title: '集体朗诵挑战', difficulty: 1, timeLimit: 60, content: '全队一起朗诵一段指定内容，要求声音整齐、节奏统一、情感充沛。', tags: ['合作', '朗诵'] },
    { id: 'tc2', type: 'team_cooperate', title: '你演我猜', difficulty: 2, timeLimit: 90, content: '一名队员用肢体语言表演一个成语，其他队员猜。猜对3个即为成功！', tags: ['合作', '默契'] },
    { id: 'tc3', type: 'team_cooperate', title: '团队配音', difficulty: 3, timeLimit: 120, content: '全队为一段动画片段配音，每人分配不同角色，要求配合默契。', tags: ['合作', '配音'] },
    { id: 'tc4', type: 'team_cooperate', title: '接力编故事', difficulty: 2, timeLimit: 90, content: '队员围成一圈，每人续编30秒故事。要求情节连贯、有创意。', tags: ['合作', '创意'] },
    { id: 'tc5', type: 'team_cooperate', title: '同步绕口令', difficulty: 2, timeLimit: 40, content: '全队齐声说同一个绕口令，要求完全同步，不能有人快有人慢。', tags: ['合作', '同步'] },
    { id: 'tc6', type: 'team_cooperate', title: '角色小剧场', difficulty: 3, timeLimit: 180, content: '全队即兴表演一个2分钟的小短剧，每人有角色有台词，考验团队配合。', tags: ['合作', '表演'] },
  ],
}

function loadQuestionBank(): Record<string, Question[]> {
  try {
    const stored = localStorage.getItem('speech_question_bank')
    if (stored) {
      const parsed = JSON.parse(stored)
      // 检查是否缺少新分类，自动补充（不覆盖用户已编辑的内容）
      let needsUpdate = false
      for (const key of Object.keys(defaultQuestions)) {
        if (!parsed[key]) {
          parsed[key] = defaultQuestions[key]
          needsUpdate = true
        }
      }
      if (needsUpdate) {
        localStorage.setItem('speech_question_bank', JSON.stringify(parsed))
      }
      return parsed
    }
  } catch (e) {
    console.error('加载题库失败', e)
  }
  const defaultCopy = JSON.parse(JSON.stringify(defaultQuestions))
  localStorage.setItem('speech_question_bank', JSON.stringify(defaultCopy))
  return defaultCopy
}

export function saveQuestionBank(bank: Record<string, Question[]>) {
  localStorage.setItem('speech_question_bank', JSON.stringify(bank))
}


export const questionBank: Record<string, Question[]> = loadQuestionBank()

export function getRandomQuestion(type: string, difficulty: number, excludeIds: string[] = []): Question | null {
  const pool = questionBank[type]
  if (!pool || pool.length === 0) return null
  const available = pool.filter(q => q.difficulty <= difficulty && !excludeIds.includes(q.id))
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
  'team_battle': 'team_battle',
  'team_cooperate': 'team_cooperate',
}

export const CARD_POOL = [
  { id: 'card_skip', name: '免答卡', description: '跳过当前任务，直接获得2分', icon: '🛡️', rarity: 'common' },
  { id: 'card_double', name: '双倍积分卡', description: '本次任务得分翻倍', icon: '✨', rarity: 'rare' },
  { id: 'card_assign', name: '指定卡', description: '指定同学代替完成，两人平分得分', icon: '👉', rarity: 'rare' },
  { id: 'card_steal', name: '偷分卡', description: '从指定同学那里偷取2分', icon: '🕵️', rarity: 'epic' },
  { id: 'card_shield', name: '护盾卡', description: '抵御一次负面效果', icon: '🔰', rarity: 'common' },
  { id: 'card_swap', name: '交换卡', description: '与指定同学交换位置', icon: '🔄', rarity: 'epic' },
  { id: 'card_lucky', name: '幸运卡', description: '随机获得2-5分', icon: '🍀', rarity: 'common' },
  { id: 'card_double_dice', name: '双骰卡', description: '掷两个骰子，取较大的点数', icon: '🎲', rarity: 'rare' },
  { id: 'card_remote', name: '遥控卡', description: '直接选择1-6的步数前进', icon: '🎯', rarity: 'epic' },
  { id: 'card_sprint', name: '抢跑卡', description: '本次移动额外多走2步', icon: '🏃', rarity: 'common' },
]
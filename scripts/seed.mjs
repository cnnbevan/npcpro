import 'dotenv/config';
import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: process.env.DB_HOST || '192.168.11.19',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'evanevan2025',
  database: process.env.DB_NAME || 'npcdb',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  namedPlaceholders: true,
  timezone: 'Z',
});

const moviesData = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: '霸王别姬',
    originalTitle: 'Farewell My Concubine',
    releaseYear: 1993,
    language: 'zh-CN',
    runtimeMinutes: 171,
    genres: ['剧情', '爱情', '历史'],
    posterUrl: 'https://example.com/posters/farewell-my-concubine.jpg',
    synopsis: '两名京剧伶人程蝶衣与段小楼在时代洪流中的纠葛与悲剧。',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: '无间道',
    originalTitle: 'Infernal Affairs',
    releaseYear: 2002,
    language: 'zh-CN',
    runtimeMinutes: 101,
    genres: ['犯罪', '惊悚'],
    posterUrl: 'https://example.com/posters/infernal-affairs.jpg',
    synopsis: '一名警方卧底与黑帮安插的内鬼在善恶之间相互追逐。',
  },
];

const charactersData = [
  {
    id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    movieId: moviesData[0].id,
    name: '程蝶衣',
    aliases: ['小豆子'],
    actorName: '张国荣',
    description: '自小习艺成为旦角，大半生沉浸在戏里戏外的情感旋涡。',
    traits: { 性格: '执着', 擅长: '京剧' },
    isPrimary: true,
    createdBy: 'seed-script',
  },
  {
    id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    movieId: moviesData[0].id,
    name: '段小楼',
    aliases: ['小石头'],
    actorName: '张丰毅',
    description: '程蝶衣的师兄与搭档，性格刚毅，在乱世中摇摆。',
    traits: { 性格: '侠义', 内心: '矛盾' },
    isPrimary: true,
    createdBy: 'seed-script',
  },
  {
    id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    movieId: moviesData[1].id,
    name: '陈永仁',
    aliases: ['Lau Kin Ming'],
    actorName: '梁朝伟',
    description: '警方卧底，长期深陷黑帮与警队身份冲突。',
    traits: { 性格: '沉稳', 特质: '双面人生' },
    isPrimary: true,
    createdBy: 'seed-script',
  },
  {
    id: 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    movieId: moviesData[1].id,
    name: '刘健明',
    aliases: ['刘sir'],
    actorName: '刘德华',
    description: '黑帮潜伏在警队的内鬼，渴望洗白却难逃宿命。',
    traits: { 性格: '野心', 矛盾: '良知与欲望' },
    isPrimary: true,
    createdBy: 'seed-script',
  },
];

const scenesData = [
  {
    id: 's1111111-1111-4111-8111-111111111111',
    movieId: moviesData[0].id,
    sceneNumber: 1,
    startMs: 0,
    endMs: 600000,
    summary: '少年小豆子与小石头在梨园学戏，结下深厚情谊。',
    location: '北京戏班',
  },
  {
    id: 's2222222-2222-4222-8222-222222222222',
    movieId: moviesData[1].id,
    sceneNumber: 5,
    startMs: 1800000,
    endMs: 2400000,
    summary: '凌晨楼顶对峙，陈永仁与刘健明身份危机骤现。',
    location: '香港高楼天台',
  },
];

const subtitleSegmentsData = [
  {
    id: 'sub11111-1111-4111-8111-111111111111',
    movieId: moviesData[0].id,
    sceneId: scenesData[0].id,
    characterId: charactersData[0].id,
    startMs: 120000,
    endMs: 125000,
    speaker: '程蝶衣',
    text: '师哥，我就是程蝶衣，我一辈子就是程蝶衣。',
    confidence: 0.98,
    source: 'demo',
  },
  {
    id: 'sub22222-2222-4222-8222-222222222222',
    movieId: moviesData[1].id,
    sceneId: scenesData[1].id,
    characterId: charactersData[2].id,
    startMs: 1860000,
    endMs: 1868000,
    speaker: '陈永仁',
    text: '对不起，我真的是警察。',
    confidence: 0.99,
    source: 'demo',
  },
];

const scriptsData = [
  {
    id: 'scr11111-1111-4111-8111-111111111111',
    movieId: moviesData[0].id,
    scriptTitle: '霸王别姬剧本节选',
    plotText: '讲述程蝶衣与段小楼师兄弟在时代风雨中的裂痕。',
    screenplayText: '【剧本片段】\n程蝶衣：师哥，我们从小唱戏，戏比天大。\n段小楼：如今世道变了，唱戏不能护着我们了。',
    createdBy: 'seed-script',
  },
  {
    id: 'scr22222-2222-4222-8222-222222222222',
    movieId: moviesData[1].id,
    scriptTitle: '无间道剧本节选',
    plotText: '警方卧底与黑帮内鬼的双线对峙。',
    screenplayText: '【剧本片段】\n陈永仁：我都快忘了自己是谁。\n刘健明：做回自己，很难吗？',
    createdBy: 'seed-script',
  },
];

const dialogueFilesData = [
  {
    id: 'dlg11111-1111-4111-8111-111111111111',
    movieId: moviesData[0].id,
    fileName: 'farewell_dialogue_demo.txt',
    dialogueText: '00:20:00 程蝶衣：师哥，我这一辈子都是程蝶衣。\n00:20:08 段小楼：我们下了场，就是普通人。',
    totalLines: 2,
    createdBy: 'seed-script',
  },
  {
    id: 'dlg22222-2222-4222-8222-222222222222',
    movieId: moviesData[1].id,
    fileName: 'infernal_dialogue_demo.txt',
    dialogueText: '00:31:00 陈永仁：我要上去见黄sir。\n00:31:05 刘健明：我已经不是以前的我了。',
    totalLines: 2,
    createdBy: 'seed-script',
  },
];

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const deleteOrder = [
      'movie_dialogue_files',
      'movie_scripts',
      'subtitle_segments',
      'scenes',
      'characters',
      'movies',
    ];
    for (const table of deleteOrder) {
      await connection.query(`DELETE FROM ${table}`);
    }

    await connection.query(
      `INSERT INTO movies (id, title, original_title, release_year, language, runtime_minutes, genres, poster_url, synopsis)
       VALUES ?`,
      [moviesData.map((movie) => [
        movie.id,
        movie.title,
        movie.originalTitle,
        movie.releaseYear,
        movie.language,
        movie.runtimeMinutes,
        JSON.stringify(movie.genres),
        movie.posterUrl,
        movie.synopsis,
      ])]
    );

    await connection.query(
      `INSERT INTO characters (id, movie_id, name, aliases, actor_name, description, traits, is_primary, created_by)
       VALUES ?`,
      [charactersData.map((character) => [
        character.id,
        character.movieId,
        character.name,
        JSON.stringify(character.aliases),
        character.actorName,
        character.description,
        JSON.stringify(character.traits),
        character.isPrimary ? 1 : 0,
        character.createdBy,
      ])]
    );

    await connection.query(
      `INSERT INTO scenes (id, movie_id, scene_number, start_ms, end_ms, summary, location)
       VALUES ?`,
      [scenesData.map((scene) => [
        scene.id,
        scene.movieId,
        scene.sceneNumber,
        scene.startMs,
        scene.endMs,
        scene.summary,
        scene.location,
      ])]
    );

    await connection.query(
      `INSERT INTO subtitle_segments (id, movie_id, scene_id, character_id, start_ms, end_ms, speaker, text, confidence, source)
       VALUES ?`,
      [subtitleSegmentsData.map((segment) => [
        segment.id,
        segment.movieId,
        segment.sceneId,
        segment.characterId,
        segment.startMs,
        segment.endMs,
        segment.speaker,
        segment.text,
        segment.confidence,
        segment.source,
      ])]
    );

    await connection.query(
      `INSERT INTO movie_scripts (id, movie_id, script_title, plot_text, screenplay_text, created_by)
       VALUES ?`,
      [scriptsData.map((script) => [
        script.id,
        script.movieId,
        script.scriptTitle,
        script.plotText,
        script.screenplayText,
        script.createdBy,
      ])]
    );

    await connection.query(
      `INSERT INTO movie_dialogue_files (id, movie_id, file_name, dialogue_text, total_lines, created_by)
       VALUES ?`,
      [dialogueFilesData.map((dialogue) => [
        dialogue.id,
        dialogue.movieId,
        dialogue.fileName,
        dialogue.dialogueText,
        dialogue.totalLines,
        dialogue.createdBy,
      ])]
    );

    await connection.commit();
    console.log('✅ Seed data inserted successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();

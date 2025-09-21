import pool from "../api/lib/db.js";

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const deleteOrder = [
      "movie_dialogue_files",
      "movie_scripts",
      "subtitle_segments",
      "scenes",
      "characters",
      "movies",
    ];

    for (const table of deleteOrder) {
      await connection.query(`DELETE FROM ${table}`);
    }

    await connection.query(
      `INSERT INTO movies (id, title, original_title, release_year, language, runtime_minutes, genres, poster_url, synopsis)
       VALUES ?`,
      [[
        [
          "11111111-1111-4111-8111-111111111111",
          "霸王别姬",
          "Farewell My Concubine",
          1993,
          "zh-CN",
          171,
          JSON.stringify(["剧情", "爱情", "历史"]),
          "https://example.com/posters/farewell-my-concubine.jpg",
          "两名京剧伶人程蝶衣与段小楼在时代洪流中的纠葛与悲剧。",
        ],
        [
          "22222222-2222-4222-8222-222222222222",
          "无间道",
          "Infernal Affairs",
          2002,
          "zh-CN",
          101,
          JSON.stringify(["犯罪", "惊悚"]),
          "https://example.com/posters/infernal-affairs.jpg",
          "一名警方卧底与黑帮安插的内鬼在善恶之间相互追逐。",
        ],
      ]]
    );

    await connection.query(
      `INSERT INTO characters (id, movie_id, name, aliases, actor_name, description, traits, is_primary, created_by)
       VALUES ?`,
      [[
        [
          "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
          "11111111-1111-4111-8111-111111111111",
          "程蝶衣",
          JSON.stringify(["小豆子"]),
          "张国荣",
          "自小习艺成为旦角，大半生沉浸在戏里戏外的情感旋涡。",
          JSON.stringify({ 性格: "执着", 擅长: "京剧" }),
          1,
          "seed-script",
        ],
        [
          "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
          "11111111-1111-4111-8111-111111111111",
          "段小楼",
          JSON.stringify(["小石头"]),
          "张丰毅",
          "程蝶衣的师兄与搭档，性格刚毅，在乱世中摇摆。",
          JSON.stringify({ 性格: "侠义", 内心: "矛盾" }),
          1,
          "seed-script",
        ],
        [
          "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
          "22222222-2222-4222-8222-222222222222",
          "陈永仁",
          JSON.stringify(["Lau Kin Ming"]),
          "梁朝伟",
          "警方卧底，长期深陷黑帮与警队身份冲突。",
          JSON.stringify({ 性格: "沉稳", 特质: "双面人生" }),
          1,
          "seed-script",
        ],
        [
          "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
          "22222222-2222-4222-8222-222222222222",
          "刘健明",
          JSON.stringify(["刘sir"]),
          "刘德华",
          "黑帮潜伏在警队的内鬼，渴望洗白却难逃宿命。",
          JSON.stringify({ 性格: "野心", 矛盾: "良知与欲望" }),
          1,
          "seed-script",
        ],
      ]]
    );

    await connection.query(
      `INSERT INTO scenes (id, movie_id, scene_number, start_ms, end_ms, summary, location)
       VALUES ?`,
      [[
        [
          "s1111111-1111-4111-8111-111111111111",
          "11111111-1111-4111-8111-111111111111",
          1,
          0,
          600000,
          "少年小豆子与小石头在梨园学戏，结下深厚情谊。",
          "北京戏班",
        ],
        [
          "s2222222-2222-4222-8222-222222222222",
          "22222222-2222-4222-8222-222222222222",
          5,
          1800000,
          2400000,
          "凌晨楼顶对峙，陈永仁与刘健明身份危机骤现。",
          "香港高楼天台",
        ],
      ]]
    );

    await connection.query(
      `INSERT INTO subtitle_segments (id, movie_id, scene_id, character_id, start_ms, end_ms, speaker, text, confidence, source)
       VALUES ?`,
      [[
        [
          "sub11111-1111-4111-8111-111111111111",
          "11111111-1111-4111-8111-111111111111",
          "s1111111-1111-4111-8111-111111111111",
          "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
          120000,
          125000,
          "程蝶衣",
          "师哥，我就是程蝶衣，我一辈子就是程蝶衣。",
          0.98,
          "demo",
        ],
        [
          "sub22222-2222-4222-8222-222222222222",
          "22222222-2222-4222-8222-222222222222",
          "s2222222-2222-4222-8222-222222222222",
          "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
          1860000,
          1868000,
          "陈永仁",
          "对不起，我真的是警察。",
          0.99,
          "demo",
        ],
      ]]
    );

    await connection.query(
      `INSERT INTO movie_scripts (id, movie_id, script_title, plot_text, screenplay_text, created_by)
       VALUES ?`,
      [[
        [
          "scr11111-1111-4111-8111-111111111111",
          "11111111-1111-4111-8111-111111111111",
          "霸王别姬剧本节选",
          "讲述程蝶衣与段小楼师兄弟在时代风雨中的裂痕。",
          "【剧本片段】\n程蝶衣：师哥，我们从小唱戏，戏比天大。\n段小楼：如今世道变了，唱戏不能护着我们了。",
          "seed-script",
        ],
        [
          "scr22222-2222-4222-8222-222222222222",
          "22222222-2222-4222-8222-222222222222",
          "无间道剧本节选",
          "警方卧底与黑帮内鬼的双线对峙。",
          "【剧本片段】\n陈永仁：我都快忘了自己是谁。\n刘健明：做回自己，很难吗？",
          "seed-script",
        ],
      ]]
    );

    await connection.query(
      `INSERT INTO movie_dialogue_files (id, movie_id, file_name, dialogue_text, total_lines, created_by)
       VALUES ?`,
      [[
        [
          "dlg11111-1111-4111-8111-111111111111",
          "11111111-1111-4111-8111-111111111111",
          "farewell_dialogue_demo.txt",
          "00:20:00 程蝶衣：师哥，我这一辈子都是程蝶衣。\n00:20:08 段小楼：我们下了场，就是普通人。",
          2,
          "seed-script",
        ],
        [
          "dlg22222-2222-4222-8222-222222222222",
          "22222222-2222-4222-8222-222222222222",
          "infernal_dialogue_demo.txt",
          "00:31:00 陈永仁：我要上去见黄sir。\n00:31:05 刘健明：我已经不是以前的我了。",
          2,
          "seed-script",
        ],
      ]]
    );

    await connection.commit();
    console.log("✅ Seed data inserted successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

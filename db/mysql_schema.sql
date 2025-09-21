-- MySQL schema for NPC narrative project
-- Target database: npcdb

/* ------------------------------------------------------------
 * Movies catalog
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS movies (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '电影ID',
    title              TEXT NOT NULL COMMENT '影片标题',
    original_title     TEXT COMMENT '原始片名',
    release_year       SMALLINT COMMENT '上映年份',
    language           TEXT COMMENT '影片语言',
    runtime_minutes    SMALLINT COMMENT '片长（分钟）',
    genres             JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT '影片类型列表',
    poster_url         TEXT COMMENT '海报链接',
    synopsis           TEXT COMMENT '剧情简介',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY movies_title_unique_idx (title(255))
) ENGINE=InnoDB COMMENT='电影信息表';

/* ------------------------------------------------------------
 * Film characters
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS characters (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '角色ID',
    movie_id           CHAR(36) NOT NULL COMMENT '所属电影ID',
    name               TEXT NOT NULL COMMENT '角色名称',
    aliases            JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT '角色别名列表',
    actor_name         TEXT COMMENT '扮演演员',
    description        TEXT COMMENT '角色描述',
    traits             JSON NOT NULL DEFAULT (JSON_OBJECT()) COMMENT '角色特质',
    is_primary         BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否主要角色',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by         TEXT COMMENT '创建人',
    updated_by         TEXT COMMENT '更新人',
    CONSTRAINT fk_characters_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY characters_movie_name_uq (movie_id, name(255))
) ENGINE=InnoDB COMMENT='角色信息表';

/* ------------------------------------------------------------
 * Scene segmentation
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS scenes (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '场景ID',
    movie_id           CHAR(36) NOT NULL COMMENT '所属电影ID',
    scene_number       INT NOT NULL COMMENT '场景编号',
    start_ms           INT COMMENT '开始时间（毫秒）',
    end_ms             INT COMMENT '结束时间（毫秒）',
    summary            TEXT COMMENT '场景摘要',
    location           TEXT COMMENT '场景地点',
    chapter            TEXT COMMENT '所属章',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_scenes_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY scenes_movie_scene_idx (movie_id, scene_number)
) ENGINE=InnoDB COMMENT='场景信息表';

/* ------------------------------------------------------------
 * Subtitle segments
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS subtitle_segments (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '字幕片段ID',
    movie_id           CHAR(36) NOT NULL COMMENT '所属电影ID',
    scene_id           CHAR(36) COMMENT '关联场景ID',
    character_id       CHAR(36) COMMENT '关联角色ID',
    start_ms           INT NOT NULL COMMENT '开始时间（毫秒）',
    end_ms             INT NOT NULL COMMENT '结束时间（毫秒）',
    speaker            TEXT COMMENT '说话者',
    text               TEXT NOT NULL COMMENT '字幕文本',
    confidence         FLOAT COMMENT '识别置信度',
    source             TEXT COMMENT '数据来源',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT fk_subtitle_segments_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT fk_subtitle_segments_scene FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE SET NULL,
    CONSTRAINT fk_subtitle_segments_character FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    KEY subtitle_segments_movie_time_idx (movie_id, start_ms),
    FULLTEXT KEY subtitle_segments_text_fts_idx (text)
) ENGINE=InnoDB COMMENT='字幕片段表';

/* ------------------------------------------------------------
 * Movie references
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS movie_references (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '参考资料ID',
    movie_id           CHAR(36) NOT NULL COMMENT '所属电影ID',
    type               ENUM('plot_point', 'background', 'trivia', 'marketing') NOT NULL COMMENT '参考类型',
    title              TEXT COMMENT '参考标题',
    content            TEXT NOT NULL COMMENT '参考内容',
    source_url         TEXT COMMENT '来源链接',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by         TEXT COMMENT '创建人',
    CONSTRAINT fk_movie_references_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='电影参考资料表';

/* ------------------------------------------------------------
 * Movie scripts (full plot & screenplay text)
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS movie_scripts (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '剧本ID',
    movie_id           CHAR(36) NOT NULL COMMENT '关联电影ID',
    script_title       TEXT COMMENT '剧本标题',
    plot_text          LONGTEXT COMMENT '剧情文本',
    screenplay_text    LONGTEXT NOT NULL COMMENT '剧本文本',
    created_by         TEXT COMMENT '上传人',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_movie_scripts_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY movie_scripts_movie_idx (movie_id)
) ENGINE=InnoDB COMMENT='影片剧本表';

/* ------------------------------------------------------------
 * Movie dialogue files (raw dialogue text uploads)
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS movie_dialogue_files (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '对白文件ID',
    movie_id           CHAR(36) NOT NULL COMMENT '关联电影ID',
    file_name          TEXT COMMENT '文件名',
    dialogue_text      LONGTEXT NOT NULL COMMENT '对白全文文本',
    total_lines        INT COMMENT '对白行数',
    created_by         TEXT COMMENT '上传人',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_movie_dialogue_files_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY movie_dialogue_files_movie_idx (movie_id)
) ENGINE=InnoDB COMMENT='影片对白文件表';

/* ------------------------------------------------------------
 * Character notes
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS character_notes (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '笔记ID',
    character_id       CHAR(36) NOT NULL COMMENT '角色ID',
    note_type          ENUM('persona', 'relationship', 'backstory', 'speech_pattern', 'other') NOT NULL COMMENT '笔记类型',
    content            TEXT NOT NULL COMMENT '笔记内容',
    source             TEXT COMMENT '来源说明',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by         TEXT COMMENT '创建人',
    CONSTRAINT fk_character_notes_character FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='角色笔记表';

/* ------------------------------------------------------------
 * Narrative request audit
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS narrative_requests (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '请求ID',
    user_id            CHAR(36) COMMENT '用户ID',
    movie_id           CHAR(36) COMMENT '关联电影ID',
    character_id       CHAR(36) COMMENT '关联角色ID',
    request_payload    JSON NOT NULL COMMENT '请求参数JSON',
    status             ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled') NOT NULL DEFAULT 'queued' COMMENT '请求状态',
    started_at         TIMESTAMP NULL COMMENT '开始时间',
    completed_at       TIMESTAMP NULL COMMENT '完成时间',
    result_token_usage INT COMMENT '令牌用量',
    cache_hit          BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否命中缓存',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT fk_narrative_requests_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE SET NULL,
    CONSTRAINT fk_narrative_requests_character FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    KEY narrative_requests_lookup_idx (created_at)
) ENGINE=InnoDB COMMENT='叙事请求记录表';

/* ------------------------------------------------------------
 * Narrative outputs
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS narrative_outputs (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '结果ID',
    request_id         CHAR(36) NOT NULL COMMENT '关联请求ID',
    model_name         TEXT NOT NULL COMMENT '模型名称',
    prompt_version     TEXT COMMENT '提示词版本',
    story_markdown     TEXT NOT NULL COMMENT '故事内容Markdown',
    timeline_json      JSON COMMENT '时间线JSON',
    quality_score      SMALLINT COMMENT '质量评分',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT fk_narrative_outputs_request FOREIGN KEY (request_id) REFERENCES narrative_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='叙事结果表';

/* ------------------------------------------------------------
 * Prompt chunks cache
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS prompt_chunks (
    id                 CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '提示块ID',
    movie_id           CHAR(36) NOT NULL COMMENT '关联电影ID',
    chunk_type         ENUM('synopsis', 'scene', 'dialogue', 'character_note') NOT NULL COMMENT '提示块类型',
    chunk_order        INT COMMENT '提示块顺序',
    content            TEXT NOT NULL COMMENT '提示块内容',
    source_ids         JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT '来源ID列表',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_prompt_chunks_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY prompt_chunks_movie_type_idx (movie_id, chunk_type, chunk_order)
) ENGINE=InnoDB COMMENT='提示块缓存表';

/* ------------------------------------------------------------
 * Subtitle embeddings (vector stored as binary blob)
 * ------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS subtitle_embeddings (
    segment_id         CHAR(36) NOT NULL COMMENT '字幕片段ID',
    movie_id           CHAR(36) NOT NULL COMMENT '电影ID',
    embedding          BLOB COMMENT '嵌入向量数据',
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (segment_id),
    CONSTRAINT fk_subtitle_embeddings_segment FOREIGN KEY (segment_id) REFERENCES subtitle_segments(id) ON DELETE CASCADE,
    CONSTRAINT fk_subtitle_embeddings_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY subtitle_embeddings_movie_idx (movie_id)
) ENGINE=InnoDB COMMENT='字幕嵌入向量表';

/* ------------------------------------------------------------
 * Character dialogue view (non-materialized)
 * ------------------------------------------------------------ */
CREATE OR REPLACE VIEW character_dialogue_view AS
SELECT
    ss.id          AS segment_id,
    ss.movie_id,
    ss.character_id,
    c.name         AS character_name,
    ss.start_ms,
    ss.end_ms,
    ss.text
FROM subtitle_segments ss
LEFT JOIN characters c ON c.id = ss.character_id;

-- Add tables for movie scripts and dialogue files

CREATE TABLE IF NOT EXISTS movie_scripts (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '剧本ID',
    movie_id CHAR(36) NOT NULL COMMENT '关联电影ID',
    script_title TEXT COMMENT '剧本标题',
    plot_text LONGTEXT COMMENT '剧情文本',
    screenplay_text LONGTEXT NOT NULL COMMENT '剧本文本',
    created_by TEXT COMMENT '上传人',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_movie_scripts_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY movie_scripts_movie_idx (movie_id)
) ENGINE=InnoDB COMMENT='影片剧本表';

CREATE TABLE IF NOT EXISTS movie_dialogue_files (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()) COMMENT '对白文件ID',
    movie_id CHAR(36) NOT NULL COMMENT '关联电影ID',
    file_name TEXT COMMENT '文件名',
    dialogue_text LONGTEXT NOT NULL COMMENT '对白全文文本',
    total_lines INT COMMENT '对白行数',
    created_by TEXT COMMENT '上传人',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_movie_dialogue_files_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    KEY movie_dialogue_files_movie_idx (movie_id)
) ENGINE=InnoDB COMMENT='影片对白文件表';

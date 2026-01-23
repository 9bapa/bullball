-- Drop existing table if needed (for re-running migrations)
DROP TABLE IF EXISTS bullrhun_memes CASCADE;

-- Create bullrhun_memes table
-- Stores meme media (images, GIFs, videos) for the gallery

CREATE TABLE bullrhun_memes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    media_url text NOT NULL,
    media_type text DEFAULT 'image',
    tags text[],
    is_featured boolean DEFAULT false,
    likes_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT bullrhun_memes_media_url_not_empty CHECK ((length(trim(media_url)) > 0)),
    CONSTRAINT bullrhun_memes_likes_count_check CHECK ((likes_count >= 0)),
    CONSTRAINT bullrhun_memes_view_count_check CHECK ((view_count >= 0)),
    CONSTRAINT bullrhun_memes_media_type_check CHECK ((media_type) IN ('image', 'video'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_memes_is_featured ON bullrhun_memes(is_featured);
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON bullrhun_memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_likes_count ON bullrhun_memes(likes_count DESC);

-- Add table comment
COMMENT ON TABLE bullrhun_memes IS 'BullRhun meme gallery media (images, GIFs, videos) with metadata and engagement metrics';

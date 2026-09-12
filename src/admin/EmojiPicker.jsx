// src/admin/EmojiPicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './EmojiPicker.module.css';

// ===== CURATED EMOJI SET FOR BRANDING / PRINTING =====
const EMOJI_CATEGORIES = {
  'Branding': [
    '🏷️', '🎨', '✨', '⭐', '🌟', '💫', '🎯', '💎', '👑', '🏆',
    '🔥', '💥', '⚡', '🌈', '🎪', '🎭', '🎁', '🎀', '💝', '❤️',
    '💜', '🧡', '💛', '💚', '💙', '🖤', '🤍', '💗', '💖', '💘'
  ],
  'Printing': [
    '🖨️', '📄', '📃', '📋', '📑', '📰', '📜', '📖', '📚', '📕',
    '📗', '📘', '📙', '📓', '📔', '🗞️', '📌', '📍', '📎', '🖇️',
    '✂️', '📏', '📐', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '✏️', '📝'
  ],
  'Vehicles': [
    '🚗', '🚙', '🚕', '🚌', '🚐', '🚚', '🚛', '🚜', '🏎️', '🚓',
    '🚔', '🚒', '🚑', '🛻', '🛵', '🏍️', '🛺', '🚲', '🛴', '✈️',
    '🚁', '⛵', '🚤', '🛥️', '🚢', '🚂', '🚆', '🚇', '🚉', '🛸'
  ],
  'Signage': [
    '🪧', '🚦', '🚥', '⛔', '🚫', '⚠️', '🛑', '🔴', '🟢', '🔵',
    '🟡', '🟣', '⬆️', '⬇️', '⬅️', '➡️', '↗️', '↘️', '🔺', '🔻',
    '📍', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🎏', '🎐'
  ],
  'Business': [
    '💼', '🏢', '🏬', '🏭', '🏪', '🏫', '🏥', '🏦', '💼', '👔',
    '👞', '👜', '💰', '💵', '💴', '💶', '💷', '💸', '💳', '📊',
    '📈', '📉', '📆', '📅', '🗓️', '🖥️', '💻', '⌨️', '🖱️', '📱'
  ],
  'Education': [
    '🎓', '📚', '📖', '📕', '📗', '📘', '📙', '✏️', '📝', '🖊️',
    '🖋️', '✒️', '🖍️', '🎒', '🏫', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫',
    '👩‍🏫', '📐', '📏', '🧪', '🔬', '🧬', '🗺️', '🌍', '🌎', '🌏'
  ],
  'Food & Drink': [
    '☕', '🍕', '🍔', '🍟', '🌭', '🥪', '🥙', '🌮', '🌯', '🥗',
    '🍝', '🍜', '🍣', '🍱', '🍛', '🍚', '🥘', '🍲', '🥫', '🍱',
    '🍰', '🎂', '🍪', '🍩', '🍪', '🍫', '🍬', '🍭', '🍯', '🍯'
  ],
  'Nature': [
    '🌱', '🌿', '🍀', '🌳', '🌲', '🌴', '🌵', '🌸', '🌺', '🌻',
    '🌷', '🌹', '🥀', '💐', '🌾', '🌊', '💧', '💦', '☔', '⚡',
    '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️'
  ],
  'People & Faces': [
    '😊', '😍', '🤩', '😎', '🤗', '🙌', '👏', '🤝', '👍', '👌',
    '✌️', '🤞', '🙏', '💪', '🧠', '👀', '👁️', '👤', '👥', '🧑',
    '👨', '👩', '🧒', '👶', '🧓', '👴', '👵', '🤴', '👸', '🦸'
  ],
  'Tech': [
    '💻', '🖥️', '⌨️', '🖱️', '📱', '📲', '☎️', '📞', '📟', '📠',
    '🎮', '🕹️', '🎧', '🎤', '📷', '📸', '📹', '🎥', '📺', '📻',
    '💡', '🔦', '🕯️', '🔌', '🔋', '💾', '💿', '📀', '🎥', '🛰️'
  ],
  'Shapes': [
    '⭐', '🌟', '✨', '💫', '⚡', '💥', '🔥', '❄️', '🌀', '💠',
    '🔷', '🔶', '🔹', '🔸', '▪️', '▫️', '◾', '◽', '⬛', '⬜',
    '🔺', '🔻', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪'
  ],
  'Misc': [
    '🎵', '🎶', '🎼', '🎤', '🎧', '🎷', '🎸', '🎹', '🥁', '🎺',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🎯', '🎲', '🎰', '🃏', '🎴', '🀄', '🎭', '🎨', '🎪', '🎬'
  ]
};

const EmojiPicker = ({ value, onChange, color = '#ad1380' }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Branding');
  const [search, setSearch] = useState('');
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSelect = (emoji) => {
    onChange(emoji);
    setOpen(false);
  };

  // Filter by search
  const categories = Object.keys(EMOJI_CATEGORIES);
  const visibleEmojis = search
    ? Object.values(EMOJI_CATEGORIES).flat().filter((_, i) => i < 200) // flatten & limit
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div className={styles.emojiPicker}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.trigger}
        aria-label="Pick an emoji"
      >
        <span
          className={styles.triggerEmoji}
          style={{ background: color }}
        >
          {value || '⭐'}
        </span>
        <span className={styles.triggerLabel}>Pick icon</span>
      </button>

      {/* Popover */}
      {open && (
        <div ref={popoverRef} className={styles.popover}>
          {/* Header */}
          <div className={styles.popoverHeader}>
            <input
              type="text"
              placeholder="Search emojis…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={styles.closeBtn}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Category tabs */}
          {!search && (
            <div className={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Emoji grid */}
          <div className={styles.grid}>
            {visibleEmojis.length === 0 && (
              <p className={styles.noResults}>No emojis found</p>
            )}
            {visibleEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                className={`${styles.emojiBtn} ${value === emoji ? styles.emojiSelected : ''}`}
                onClick={() => handleSelect(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className={styles.footer}>
            <span>Click any emoji to select</span>
            <button
              type="button"
              onClick={() => handleSelect('⭐')}
              className={styles.resetBtn}
            >
              Reset to ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
import React, { useState } from 'react';

interface RuleSection {
  title: string;
  icon: string;
  content: string[];
}

const RULES: RuleSection[] = [
  {
    title: 'Objective',
    icon: '🎯',
    content: [
      'Go is a strategy board game for two players — Black and White.',
      'The goal is to control more territory on the board than your opponent.',
      'Territory = empty intersections surrounded by your stones + your stones on the board.',
    ],
  },
  {
    title: 'The Board',
    icon: '📐',
    content: [
      'The game is played on a grid of intersections (not squares).',
      'Standard sizes: 9×9 (beginner), 13×13 (intermediate), 19×19 (full game).',
      'Black always plays first.',
      'Players alternate turns, placing one stone per turn.',
    ],
  },
  {
    title: 'Placing Stones',
    icon: '⬤',
    content: [
      'On your turn, place one stone on any empty intersection.',
      'Once placed, stones do not move — they stay until captured.',
      'Stones connect orthogonally (up, down, left, right) — not diagonally.',
      'Connected stones of the same color form a "group".',
    ],
  },
  {
    title: 'Liberties & Capture',
    icon: '💨',
    content: [
      'A "liberty" is an empty intersection directly adjacent to a stone or group.',
      'When a group\'s last liberty is filled by the opponent, it is captured and removed.',
      'You can capture a single stone or an entire group at once.',
      'Captured stones are kept as prisoners and count toward your score.',
    ],
  },
  {
    title: 'Ko Rule',
    icon: '🔄',
    content: [
      'You may not immediately recreate the previous board position.',
      'This prevents infinite capture-recapture loops.',
      'To recapture, you must first play somewhere else (a "ko threat").',
      'If your opponent responds elsewhere, you may then recapture.',
    ],
  },
  {
    title: 'Suicide Rule',
    icon: '🚫',
    content: [
      'You cannot place a stone that would have zero liberties after the move.',
      'Exception: if placing the stone captures opponent stones and creates liberties, the move is legal.',
      'In short: a move that kills your own group with no captures is illegal.',
    ],
  },
  {
    title: 'Passing & Ending',
    icon: '⏭️',
    content: [
      'Instead of playing, you may "Pass" your turn.',
      'Two consecutive passes end the game.',
      'You may also "Resign" at any time — your opponent wins immediately.',
    ],
  },
  {
    title: 'Scoring (Chinese Rules)',
    icon: '🏆',
    content: [
      'Black score = Black stones on board + Black territory',
      'White score = White stones on board + White territory + Komi',
      'Komi (7.5) compensates White for Black\'s first-move advantage.',
      'Territory = empty points completely surrounded by one color.',
      'Points between both colors are neutral (dame) and score for nobody.',
      'The player with the higher total wins.',
    ],
  },
];

export function Rulebook() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(RULES.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="rulebook">
      <div className="rulebook-header">
        <h2>
          <span className="rulebook-icon">📖</span>
          How to Play Go
        </h2>
        <div className="rulebook-toggle-all">
          <button className="btn-link" onClick={expandAll}>
            Expand all
          </button>
          <span className="separator">·</span>
          <button className="btn-link" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <div className="rulebook-intro">
        <p>
          Go (囲碁) is one of the oldest board games in the world, originating in
          China over 2,500 years ago. Despite simple rules, it offers incredible
          strategic depth.
        </p>
      </div>

      <div className="rulebook-sections">
        {RULES.map((section, index) => (
          <div
            key={index}
            className={`rulebook-section ${expandedSections.has(index) ? 'expanded' : ''}`}
          >
            <button
              className="rulebook-section-header"
              onClick={() => toggleSection(index)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
              <span className="section-chevron">
                {expandedSections.has(index) ? '▾' : '▸'}
              </span>
            </button>
            {expandedSections.has(index) && (
              <div className="rulebook-section-content">
                <ul>
                  {section.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rulebook-tip">
        <span className="tip-icon">💡</span>
        <p>
          <strong>Tip:</strong> Start with a 9×9 board to learn the basics.
          Games are short and you'll quickly understand captures, territory, and strategy!
        </p>
      </div>
    </div>
  );
}

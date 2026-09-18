import React, { useState } from 'react';

interface RuleSection {
  title: string;
  content: string[];
}

const RULES: RuleSection[] = [
  {
    title: 'Objective',
    content: [
      'Two players — Black and White — take turns placing stones on empty intersections.',
      'The goal is to surround more territory than your opponent.',
      'Score = stones on board + empty points enclosed by your stones.',
    ],
  },
  {
    title: 'The Board',
    content: [
      'Stones are placed on intersections, not inside squares.',
      'Three standard sizes: 9×9, 13×13, and 19×19.',
      'Black always moves first. Players alternate turns.',
    ],
  },
  {
    title: 'Liberties',
    content: [
      'A liberty is an empty point directly next to a stone (up, down, left, right).',
      'Connected stones of the same color share their liberties as a group.',
      'A group with no liberties is captured and removed from the board.',
    ],
  },
  {
    title: 'Capturing',
    content: [
      'Surround an opponent\'s stone or group completely to capture it.',
      'Captured stones become prisoners and count toward your score.',
      'You can capture one stone or an entire group in a single move.',
    ],
  },
  {
    title: 'Ko',
    content: [
      'You cannot immediately recreate the previous board position.',
      'This prevents endless capture-and-recapture loops.',
      'Play elsewhere first (a "ko threat"), then you may recapture.',
    ],
  },
  {
    title: 'Suicide',
    content: [
      'You cannot play a stone that would have no liberties after the move.',
      'Exception: if the move captures opponent stones, creating liberties, it is legal.',
    ],
  },
  {
    title: 'Passing & Ending',
    content: [
      'You may pass instead of playing. Two consecutive passes end the game.',
      'You may resign at any time — your opponent wins immediately.',
    ],
  },
  {
    title: 'Scoring',
    content: [
      'Chinese area scoring: Black = stones + territory. White = stones + territory + komi.',
      'Komi (default 7.5) compensates White for Black\'s first-move advantage.',
      'Empty points adjacent to both colors are neutral and score for neither.',
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
        <div className="rulebook-title-block">
          <h2>Rules of Go</h2>
          <p className="rulebook-subtitle">A quick reference</p>
        </div>
        <div className="rulebook-toggle-all">
          <button
            className="btn-link"
            onClick={expandedSections.size === RULES.length ? collapseAll : expandAll}
          >
            {expandedSections.size === RULES.length ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      <div className="rulebook-intro">
        <p>
          Go is a strategy game of territory, over 2,500 years old.
          Simple rules — infinite depth.
        </p>
      </div>

      <ol className="rulebook-sections">
        {RULES.map((section, index) => {
          const isExpanded = expandedSections.has(index);
          return (
            <li
              key={index}
              className={`rulebook-section ${isExpanded ? 'expanded' : ''}`}
            >
              <button
                className="rulebook-section-header"
                onClick={() => toggleSection(index)}
                aria-expanded={isExpanded}
              >
                <span className="section-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="section-title">{section.title}</span>
                <span className="section-chevron" aria-hidden="true" />
              </button>
              <div className="rulebook-section-content">
                <ul>
                  {section.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rulebook-tip">
        <p>
          <span className="tip-label">Tip</span>
          Start with a 9×9 board to learn the basics. Games are short and
          you'll quickly understand captures, territory, and strategy.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { parseSgfToGameState } from '../../sgf';
import { GameState } from '../../game/types';

interface SgfImportDialogProps {
  onImport: (state: GameState) => void;
  onClose: () => void;
}

export function SgfImportDialog({ onImport, onClose }: SgfImportDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [sgfContent, setSgfContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSgfContent(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!sgfContent.trim()) {
      setError('Please provide SGF content');
      return;
    }

    const result = parseSgfToGameState(sgfContent);
    
    if (result.success) {
      onImport(result.state);
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setSgfContent(text);
      setError(null);
    }).catch(() => {
      setError('Failed to read clipboard');
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Import SGF</h2>
        
        <div className="dialog-section">
          <label className="dialog-label">Upload SGF File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sgf,.SGF"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>

        <div className="dialog-section">
          <label className="dialog-label">Or Paste SGF Content</label>
          <div className="sgf-input-container">
            <textarea
              value={sgfContent}
              onChange={(e) => {
                setSgfContent(e.target.value);
                setError(null);
              }}
              placeholder="(;GM[1]FF[4]SZ[19]...)"
              className="sgf-textarea"
              rows={8}
            />
            <button onClick={handlePaste} className="btn btn-ghost btn-small">
              Paste
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={!sgfContent.trim()}
          >
            Import Game
          </button>
        </div>
      </div>
    </div>
  );
}

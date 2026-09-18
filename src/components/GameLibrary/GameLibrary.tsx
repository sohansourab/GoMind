import { useState, useEffect } from 'react';
import { listGames, deleteGame, loadFullGame, renameGame, generateDefaultGameName } from '../../storage/api';
import { GameSummary, SavedGame } from '../../storage/types';
import { GameState } from '../../game/types';
import { GameCard } from './GameCard';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { RenameDialog } from './RenameDialog';

interface GameLibraryProps {
  onContinueGame: (gameState: GameState, gameId: string) => void;
  onReviewGame: (gameState: GameState, gameId: string) => void;
  onClose: () => void;
}

export function GameLibrary({ onContinueGame, onReviewGame, onClose }: GameLibraryProps) {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<GameSummary | null>(null);
  const [gameToRename, setGameToRename] = useState<SavedGame | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedGames = await listGames();
      setGames(loadedGames);
    } catch (err) {
      console.error('Failed to load games:', err);
      setError('Failed to load games. Storage may be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (gameId: string) => {
    try {
      const savedGame = await loadFullGame(gameId);
      if (savedGame) {
        onContinueGame(savedGame.gameState, gameId);
      }
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game.');
    }
  };

  const handleReview = async (gameId: string) => {
    try {
      const savedGame = await loadFullGame(gameId);
      if (savedGame) {
        onReviewGame(savedGame.gameState, gameId);
      }
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game.');
    }
  };

  const handleDeleteClick = (game: GameSummary) => {
    setGameToDelete(game);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    try {
      await deleteGame(gameToDelete.id);
      setGames(games.filter(g => g.id !== gameToDelete.id));
      setGameToDelete(null);
    } catch (err) {
      console.error('Failed to delete game:', err);
      setError('Failed to delete game.');
    }
  };

  const handleDeleteCancel = () => {
    setGameToDelete(null);
  };

  const handleRenameClick = async (gameId: string) => {
    try {
      const savedGame = await loadFullGame(gameId);
      if (savedGame) {
        setGameToRename(savedGame);
      }
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game.');
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!gameToRename) return;

    try {
      await renameGame(gameToRename.id, newName);
      // Update the game in the list
      setGames(games.map(g => 
        g.id === gameToRename.id ? { ...g, name: newName } : g
      ));
      setGameToRename(null);
    } catch (err) {
      console.error('Failed to rename game:', err);
      setError('Failed to rename game.');
    }
  };

  const handleRenameCancel = () => {
    setGameToRename(null);
  };

  const filteredGames = games.filter(game => {
    if (filter === 'active') return !game.isCompleted;
    if (filter === 'completed') return game.isCompleted;
    return true;
  });

  const activeGames = filteredGames.filter(g => !g.isCompleted);
  const completedGames = filteredGames.filter(g => g.isCompleted);

  if (loading) {
    return (
      <div className="game-library">
        <div className="library-header">
          <h2>Game Library</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="library-loading">
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-library">
        <div className="library-header">
          <h2>Game Library</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="library-error">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadGames}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-library">
      <div className="library-header">
        <h2>Game Library</h2>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      {games.length === 0 ? (
        <div className="library-empty">
          <p>No saved games yet.</p>
          <p>Start a new game to see it here.</p>
        </div>
      ) : (
        <>
          <div className="library-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({games.length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({games.filter(g => !g.isCompleted).length})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({games.filter(g => g.isCompleted).length})
            </button>
          </div>

          <div className="library-content">
            {activeGames.length > 0 && (
              <div className="library-section">
                <h3>Active Games</h3>
                <div className="game-list">
                  {activeGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onContinue={handleContinue}
                      onDelete={handleDeleteClick}
                      onRename={handleRenameClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedGames.length > 0 && (
              <div className="library-section">
                <h3>Completed Games</h3>
                <div className="game-list">
                  {completedGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onReview={handleReview}
                      onDelete={handleDeleteClick}
                      onRename={handleRenameClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {gameToDelete && (
        <DeleteConfirmDialog
          game={gameToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {gameToRename && (
        <RenameDialog
          game={gameToRename}
          onConfirm={handleRenameConfirm}
          onCancel={handleRenameCancel}
        />
      )}
    </div>
  );
}

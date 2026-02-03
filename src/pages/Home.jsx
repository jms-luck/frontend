import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./problems.css"

const ProblemListing = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('https://172.168.146.217:5000/api/problems');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const normalized = Array.isArray(data) ? data.filter(Boolean) : [];
        setProblems(normalized);
        setFilteredProblems(normalized);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    let filtered = [...problems];

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(problem =>
        problem.difficulty === selectedDifficulty
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(problem => {
        const tags = Array.isArray(problem.tags) ? problem.tags : [];
        const title = (problem.title || '').toLowerCase();
        const description = (problem.description || '').toLowerCase();
        return title.includes(term) ||
          description.includes(term) ||
          tags.some(tag => (tag || '').toLowerCase().includes(term));
      });
    }

    // Sort problems
    if (sortBy === 'difficulty') {
      const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (sortBy === 'points') {
      filtered.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'acceptance') {
      filtered.sort((a, b) => parseFloat(b.acceptance) - parseFloat(a.acceptance));
    }

    setFilteredProblems(filtered);
  }, [selectedDifficulty, searchTerm, sortBy, problems]);

  const handleSolve = (problemId) => {
    navigate(`/solve/${problemId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'var(--easy-color)';
      case 'Medium': return 'var(--medium-color)';
      case 'Hard': return 'var(--hard-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="problem-listing-container">
      <header className="problems-header">
        <div className="header-content">
          <div>
            <h1 className="problems-title">Coding Problems</h1>
            <p className="problems-subtitle">Practice your coding skills with these challenges</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="controls-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search problems by title, tags, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-container">
          <div className="difficulty-filters">
            <button
              className={`difficulty-btn ${selectedDifficulty === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('All')}
            >
              All
            </button>
            {['Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                className={`difficulty-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(diff)}
                style={{ '--diff-color': getDifficultyColor(diff) }}
              >
                {diff}
              </button>
            ))}
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort by: Default</option>
            <option value="difficulty">Sort by: Difficulty</option>
            <option value="points">Sort by: Points</option>
            <option value="acceptance">Sort by: Acceptance</option>
          </select>
        </div>
      </div>

      <div className="stats-bar">
        <span className="stat-item">
          <span className="stat-label">Total Problems:</span>
          <span className="stat-value">{problems.length}</span>
        </span>
        <span className="stat-item">
          <span className="stat-label">Showing:</span>
          <span className="stat-value">{filteredProblems.length}</span>
        </span>
      </div>

      <div className="problems-grid">
        {filteredProblems.length === 0 ? (
          <div className="no-results">
            <p>No problems found matching your criteria.</p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSelectedDifficulty('All');
                setSearchTerm('');
                setSortBy('default');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredProblems.map(problem => (
            <div key={problem.problemId} className="problem-card">
              <div className="problem-header">
                <div className="problem-title-section">
                  <h3 className="problem-title">{problem.title}</h3>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <div className="problem-points">
                  <span className="points-badge">{problem.points} points</span>
                </div>
              </div>

              <p className="problem-description">{problem.description}</p>

              <div className="problem-tags">
                {(Array.isArray(problem.tags) ? problem.tags : []).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <div className="problem-footer">
                <div className="problem-stats">
                  <span className="acceptance-stat">
                    <span className="stat-icon">✓</span>
                    {(problem.acceptance ?? 'N/A')} Acceptance
                  </span>
                </div>
                <button
                  className="solve-btn"
                  onClick={() => handleSolve(problem.problemId)}
                >
                  Solve Problem
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemListing;
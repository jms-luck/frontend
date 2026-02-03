import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './SolveProblem.css';

const SolveProblem = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Write your code here...');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await fetch(`http://172.168.146.217:5000/api/problems/${problemId}`);
                if (!response.ok) throw new Error('Problem not found');
                const data = await response.json();
                setProblem(data);
            } catch (error) {
                console.error("Error fetching problem:", error);
                navigate('/home');
            }
        };

        if (problemId) {
            fetchProblem();
        }
    }, [problemId, navigate]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        // Simple template switching - in production improve this
        if (newLang === 'python') setCode('# Write your code here...');
        else if (newLang === 'java') setCode('// Write your code here...');
        else setCode('// Write your code here...');
    };

    const handleSubmit = async () => {
        if (!problem) return;

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert("You must be logged in to submit.");
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://172.168.146.217:5000/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${user.token}` // Ready for when middleware is added
                },
                body: JSON.stringify({
                    problemId: problem.problemId,
                    code: code,
                    language: language,
                    userId: user._id,
                    username: user.username
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }

            const data = await response.json();
            const submission = data.submission;
            const status = submission.status;
            const verdict = submission.verdict || 'No additional details.';

            if (status === 'Accepted') {
                alert(`Success! Solution submitted for ${problem.title}. Status: ${status}\nVerdict: ${verdict}`);
            } else {
                alert(`Submission received for ${problem.title}. Status: ${status}\nVerdict: ${verdict}`);
            }
        } catch (error) {
            console.error("Error submitting code:", error);
            alert(error.message || "Failed to submit code. Please try again.");
        }
    };

    if (!problem) return <div className="loading">Loading problem...</div>;

    const safeTags = Array.isArray(problem.tags) ? problem.tags : [];
    const difficulty = problem.difficulty || 'Unknown';
    const points = problem.points ?? 'N/A';
    const acceptance = problem.acceptance ?? 'N/A';

    return (
        <div className="solve-problem-container">
            <div className="problem-description-panel">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    ← Back to Problems
                </button>

                <h1 className="problem-title">{problem.title || 'Untitled Problem'}</h1>

                <div className="problem-meta">
                    <span className={`difficulty-badge`}
                        style={{
                            backgroundColor:
                                difficulty === 'Easy' ? 'var(--easy-color)' :
                                    difficulty === 'Medium' ? 'var(--medium-color)' :
                                        'var(--hard-color)'
                        }}>
                        {difficulty}
                    </span>
                    <span className="points-badge">{points} points</span>
                </div>

                <div className="section-title">Description</div>
                <p className="problem-text">{problem.description || 'Problem description unavailable.'}</p>

                <div className="section-title">Tags</div>
                <div className="tags-list">
                    {safeTags.length > 0 ? safeTags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    )) : <span className="tag">No tags</span>}
                </div>

                <div className="acceptance-rate">
                    Acceptance Rate: <strong>{acceptance}</strong>
                </div>
            </div>

            <div className="code-editor-panel">
                <div className="editor-header">
                    <div className="language-selector">
                        <label htmlFor="lang-select">Language:</label>
                        <select id="lang-select" value={language} onChange={handleLanguageChange}>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    <button className="submit-btn" onClick={handleSubmit}>Submit Code</button>
                </div>

                <div className="editor-wrapper">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SolveProblem;

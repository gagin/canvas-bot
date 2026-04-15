import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useOpencode } from './hooks/useOpencode';

interface Comment {
  id: string;
  selection: string;
  text: string;
  timestamp: number;
}

interface AgentResponse {
  id: string;
  content: string;
  timestamp: number;
}

function App() {
  const [filePath, setFilePath] = useState('./README.md');
  const [content, setContent] = useState('# Welcome to Canvaz\n\nSelect text and add a comment to chat with the AI agent.\n\n## Getting Started\n\n1. Open a file\n2. Select text\n3. Write a comment\n');
  const [selection, setSelection] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { connected, sendPrompt, error: opencodeError } = useOpencode();

  const handleEditorSelectionChange = useCallback((selection: string) => {
    setSelection(selection);
  }, []);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      selection,
      text: commentText,
      timestamp: Date.now(),
    };
    
    setComments(prev => [...prev, newComment]);
    setIsLoading(true);
    
    try {
      const response = await sendPrompt(commentText, selection);
      if (response) {
        const newResponse: AgentResponse = {
          id: Date.now().toString(),
          content: response,
          timestamp: Date.now(),
        };
        setResponses(prev => [...prev, newResponse]);
      }
    } catch (err) {
      console.error('Failed to send prompt:', err);
    } finally {
      setIsLoading(false);
      setCommentText('');
    }
  };

  const handleAcceptResponse = (responseId: string) => {
    const response = responses.find(r => r.id === responseId);
    if (response) {
      setContent(prev => prev + '\n\n' + response.content);
      setResponses(prev => prev.filter(r => r.id !== responseId));
    }
  };

  const handleRejectResponse = (responseId: string) => {
    setResponses(prev => prev.filter(r => r.id !== responseId));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">Canvaz</span>
          <input
            type="text"
            value={filePath}
            onChange={e => setFilePath(e.target.value)}
            placeholder="File path..."
            style={{
              padding: '4px 8px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#d4d4d4',
              width: '200px',
            }}
          />
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => setContent('')}>
            Clear
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="editor-container">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={content}
            onChange={value => setContent(value || '')}
            onMount={(editor, monaco) => {
              editor.onMouseUp(() => {
                const sel = editor.getModel()?.getValueInRange(editor.getSelection()!);
                if (sel && sel.trim()) {
                  setSelection(sel);
                }
              });
            }}
          />
          
          {selection && (
            <div className="comment-input-container">
              {selection && (
                <div className="selection-preview">
                  Comment on: "{selection.slice(0, 100)}{selection.length > 100 ? '...' : ''}"
                </div>
              )}
              <textarea
                className="comment-input"
                placeholder="Write your comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleSendComment();
                  }
                }}
              />
              <div className="comment-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelection('')}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendComment}
                  disabled={isLoading || !commentText.trim()}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="response-panel">
          <div className="response-header">
            Agent Responses ({responses.length})
          </div>
          <div className="response-list">
            {responses.length === 0 ? (
              <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                No responses yet. Select text and write a comment to get started.
              </div>
            ) : (
              responses.map(response => (
                <div key={response.id} className="response-card">
                  <div className="response-content">{response.content}</div>
                  <div className="response-actions">
                    <button
                      className="btn btn-small btn-accept"
                      onClick={() => handleAcceptResponse(response.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-small btn-reject"
                      onClick={() => handleRejectResponse(response.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{connected ? '🟢 Connected to opencode' : '🔴 Not connected'}</span>
        <span>{comments.length} comments • {responses.length} responses</span>
      </div>
    </div>
  );
}

export default App;

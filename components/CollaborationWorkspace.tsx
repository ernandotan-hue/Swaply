
import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Eraser, MousePointer2, FileText, Grid3X3, Type, Trash2, Download } from 'lucide-react';

interface CollaborationWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

const CollaborationWorkspace: React.FC<CollaborationWorkspaceProps> = ({ isOpen, onClose, partnerName }) => {
  const [activeTool, setActiveTool] = useState<'whiteboard' | 'docs' | 'sheets'>('whiteboard');
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#4f46e5');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Docs state
  const [docContent, setDocContent] = useState(`## Shared Notes with ${partnerName}\n\n- Start typing here to collaborate...\n- Goals for today:\n  1. `);

  // Sheets state
  const [gridData, setGridData] = useState<string[][]>(Array(10).fill(Array(5).fill('')));

  useEffect(() => {
    if (activeTool === 'whiteboard' && canvasRef.current) {
        const canvas = canvasRef.current;
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const context = canvas.getContext('2d');
        if (context) {
            context.scale(dpr, dpr);
            context.lineCap = 'round';
            context.strokeStyle = color;
            context.lineWidth = 3;
            contextRef.current = context;
        }
    }
  }, [activeTool, isOpen]); // Re-init canvas when opening or switching tabs

  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = drawingTool === 'eraser' ? '#ffffff' : color;
        contextRef.current.lineWidth = drawingTool === 'eraser' ? 20 : 3;
    }
  }, [color, drawingTool]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (!contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
      if (canvasRef.current && contextRef.current) {
          contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
  };

  const handleGridChange = (rowIndex: number, colIndex: number, value: string) => {
      const newData = gridData.map((row, r) => {
          if (r !== rowIndex) return row;
          return row.map((cell, c) => c === colIndex ? value : cell);
      });
      setGridData(newData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <h2 className="font-bold text-lg">Live Workspace</h2>
                </div>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTool('whiteboard')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTool === 'whiteboard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <PenTool className="w-4 h-4" /> Whiteboard
                    </button>
                    <button 
                        onClick={() => setActiveTool('docs')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTool === 'docs' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileText className="w-4 h-4" /> Docs
                    </button>
                    <button 
                        onClick={() => setActiveTool('sheets')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTool === 'sheets' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Grid3X3 className="w-4 h-4" /> Sheets
                    </button>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-100 overflow-hidden relative">
            
            {/* WHITEBOARD TOOLBAR */}
            {activeTool === 'whiteboard' && (
                <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-2">
                    <button 
                        onClick={() => setDrawingTool('pen')}
                        className={`p-2 rounded-lg ${drawingTool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        title="Pen"
                    >
                        <PenTool className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setDrawingTool('eraser')}
                        className={`p-2 rounded-lg ${drawingTool === 'eraser' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        title="Eraser"
                    >
                        <Eraser className="w-5 h-5" />
                    </button>
                    <div className="w-full h-px bg-slate-200 my-1"></div>
                    <div className="flex flex-col gap-2 p-1">
                        {['#4f46e5', '#ef4444', '#10b981', '#000000'].map(c => (
                            <button 
                                key={c} 
                                onClick={() => { setColor(c); setDrawingTool('pen'); }}
                                className={`w-6 h-6 rounded-full border-2 transition ${color === c && drawingTool === 'pen' ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <div className="w-full h-px bg-slate-200 my-1"></div>
                    <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Clear All">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* WHITEBOARD CANVAS */}
            {activeTool === 'whiteboard' && (
                <canvas 
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseLeave={finishDrawing}
                    onMouseMove={draw}
                    className="w-full h-full bg-white cursor-crosshair touch-none"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* DOCS EDITOR */}
            {activeTool === 'docs' && (
                <div className="w-full h-full p-8 max-w-4xl mx-auto">
                    <div className="bg-white w-full h-full shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                        <div className="border-b border-slate-100 p-2 flex gap-2 bg-slate-50">
                            <button className="p-1.5 hover:bg-slate-200 rounded"><Type className="w-4 h-4 text-slate-600" /></button>
                            <div className="w-px bg-slate-300 h-6 my-auto"></div>
                            <span className="text-xs text-slate-400 my-auto px-2">Auto-saved just now</span>
                        </div>
                        <textarea 
                            value={docContent}
                            onChange={(e) => setDocContent(e.target.value)}
                            className="flex-1 w-full p-8 outline-none resize-none font-mono text-slate-900 bg-white leading-relaxed"
                            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        />
                    </div>
                </div>
            )}

            {/* SPREADSHEET */}
            {activeTool === 'sheets' && (
                <div className="w-full h-full p-4 overflow-auto bg-white">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr>
                                <th className="w-10 bg-slate-50 border border-slate-200"></th>
                                {['A','B','C','D','E'].map(l => (
                                    <th key={l} className="bg-slate-50 border border-slate-200 p-2 text-sm font-semibold text-slate-600 w-40">{l}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map((row, rIndex) => (
                                <tr key={rIndex}>
                                    <td className="bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 font-medium">{rIndex + 1}</td>
                                    {row.map((cell, cIndex) => (
                                        <td key={`${rIndex}-${cIndex}`} className="border border-slate-200 p-0 bg-white">
                                            <input 
                                                type="text" 
                                                value={cell}
                                                onChange={(e) => handleGridChange(rIndex, cIndex, e.target.value)}
                                                className="w-full h-full p-2 outline-none focus:bg-indigo-50 transition text-sm text-slate-900 bg-white"
                                                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-3 flex justify-between items-center text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {partnerName.charAt(0)}
                </div>
                <span>{partnerName} is viewing</span>
            </div>
            <div className="flex gap-4">
                 <button className="flex items-center gap-1 hover:text-slate-800"><Download className="w-4 h-4" /> Export</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationWorkspace;

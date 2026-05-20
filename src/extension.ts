import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('pencil-physics-dashboard.openDashboard', () => {
        const panel = vscode.window.createWebviewPanel(
            'pencilPhysicsDashboard',
            'Pencil Physics Matrix',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const extensionRoot = context.extensionPath;
        const resultsPath = path.resolve(extensionRoot, '..', 'benchmark-results');
        const rootPath = path.resolve(extensionRoot, '..'); // Root of kaggle-cli

        const updateWebview = () => {
            panel.webview.html = getWebviewContent(resultsPath, rootPath);
        };

        updateWebview();

        // Watch the benchmark directory
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(resultsPath, '*.json'));
        watcher.onDidChange(() => updateWebview());
        watcher.onDidCreate(() => updateWebview());

        // Watch the Telemetry Calendar in the root
        const calendarWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(rootPath, 'telemetry_calendar.json'));
        calendarWatcher.onDidChange(() => updateWebview());
        calendarWatcher.onDidCreate(() => updateWebview());
        
        panel.onDidDispose(() => {
            watcher.dispose();
            calendarWatcher.dispose();
        }, null, context.subscriptions);
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(resultsPath: string, rootPath: string): string {
    // 1. Live Telemetry Diagnostic Checks
    let debugStatus = "";
    let systemFiles: string[] = [];
    
    if (!fs.existsSync(resultsPath)) {
        debugStatus = `<span style="color: #f44336; font-weight: bold;">❌ DIRECTORY NOT FOUND:</span> ${resultsPath}`;
    } else {
        try {
            systemFiles = fs.readdirSync(resultsPath);
            const runFilesCount = systemFiles.filter(f => f.endsWith('.run.json')).length;
            debugStatus = `<span style="color: #4CAF50; font-weight: bold;">✅ TARGETED PATH:</span> ${resultsPath} <br> 📂 <b>Detected:</b> ${runFilesCount} files ending in <code>.run.json</code>`;
        } catch(err: any) {
            debugStatus = `❌ Read Error: ${err.message}`;
        }
    }

    // 2. Read Telemetry Calendar
    const calendarPath = path.join(rootPath, 'telemetry_calendar.json');
    let calendarHtml = '';
    if (fs.existsSync(calendarPath)) {
        try {
            const calContent = fs.readFileSync(calendarPath, 'utf8');
            const calData = JSON.parse(calContent);
            let blocks = '';
            
            for (const [date, runs] of Object.entries(calData)) {
                const runArray = runs as any[];
                const totalCost = runArray.reduce((acc, curr) => acc + (curr.estimated_cost || 0), 0);
                blocks += `
                    <div class="cal-day">
                        <strong>${date}</strong><br>
                        ${runArray.length} Runs<br>
                        <span style="color: #4CAF50; font-size: 10px;">$${totalCost.toFixed(2)}</span>
                    </div>
                `;
            }
            
            calendarHtml = `
                <div class="calendar-container">
                    <h3 style="margin-bottom: 8px; font-size: 14px; color: var(--vscode-settings-headerForeground);">Telemetry Ledger</h3>
                    <div class="cal-grid">${blocks}</div>
                </div>
            `;
        } catch(e) {}
    }

    let leaderboardMap: Record<string, { score: number, status: string, label: string }> = {
        "Gemini 2.5 Pro": { score: 0.00, status: "untested", label: "Pending Setup ⏳" },
        "Gemini 2.5 Flash": { score: 0.00, status: "untested", label: "Pending Setup ⏳" },
        "DeepSeek V3.2": { score: 0.00, status: "untested", label: "Pending Setup ⏳" },
        "Claude Opus 4.6": { score: 0.00, status: "untested", label: "Pending Setup ⏳" },
        "Gemma 4 26B A4B": { score: 0.72, status: "success", label: "0.72" },
        "Gemini 2.0 Flash Lite": { score: 0.67, status: "success", label: "0.67" },
        "Gemini 3.1 Flash-Lite Preview": { score: 0.67, status: "success", label: "0.67" },
        "Gemma 4 31B": { score: 0.56, status: "success", label: "0.56" },
        "Claude Sonnet 4.6": { score: 0.53, status: "success", label: "0.53" },
        "Grok 4.20 (Non-Reasoning)": { score: 0.42, status: "success", label: "0.42" },
        "Qwen 3 235B A22B Instruct": { score: 0.33, status: "success", label: "0.33" },
        "Claude Opus 4.7": { score: 0.33, status: "success", label: "0.33" },
        "GLM-5": { score: 0.33, status: "success", label: "0.33" },
        "Claude Haiku 4.5": { score: 0.31, status: "success", label: "0.31" },
        "Gemini 3.1 Pro Preview": { score: 0.30, status: "success", label: "0.30" },
        "Gemini 2.0 Flash": { score: 0.26, status: "success", label: "0.26" },
        "Qwen 3 Next 80B Instruct": { score: 0.26, status: "success", label: "0.26" },
        "Qwen 3 Coder 480B": { score: 0.26, status: "success", label: "0.26" },
        "Deepseek V3.1": { score: 0.26, status: "success", label: "0.26" },
        "GPT-5.4 nano": { score: 0.26, status: "success", label: "0.26" },
        "GPT-5.4 mini": { score: 0.26, status: "success", label: "0.26" },
        "GPT-5.5": { score: 0.26, status: "success", label: "0.26" },
        "Grok 4.20 Reasoning": { score: 0.26, status: "success", label: "0.26" },
        "Qwen 3 Next 80B Thinking": { score: 0.26, status: "success", label: "0.26" },
        "Gemini 3 Flash Preview": { score: 0.26, status: "success", label: "0.26" },
        "gpt-oss-20b": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "gpt-oss-120b": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "Claude Opus 4.5": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "Claude Sonnet 4.5": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "Claude Opus 4.1": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "Claude Sonnet 4": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "DeepSeek-R1": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" },
        "GPT-5.4": { score: 0.00, status: "untested", label: "Still Needs Testing ⏳" }
    };

    systemFiles.forEach(file => {
        if (file.endsWith('.run.json')) {
            try {
                const content = fs.readFileSync(path.join(resultsPath, file), 'utf8');
                const runData = JSON.parse(content);
                
                const matchedModel = Object.keys(leaderboardMap).find(modelName => {
                    const cleanModel = modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, '').replace('runjson', '');
                    return cleanFile.includes(cleanModel) || cleanModel.includes(cleanFile);
                });

                if (matchedModel) {
                    const hasError = runData.error || runData.status === 'error' || runData.failed;
                    if (hasError) {
                        leaderboardMap[matchedModel] = {
                            score: 0.00,
                            status: "error",
                            label: `ERROR: ${runData.error || 'Pipeline Crash'}`
                        };
                    } else {
                        const history = runData.history || runData.results || [];
                        let score = 0.00;
                        if (history.length > 0) {
                            score = parseFloat(history[history.length - 1].score || history[history.length - 1].correct || 0);
                        } else {
                            score = parseFloat(runData.score || 0.00);
                        }

                        if (score > 1.0) { score = score / 100.0; }

                        const isPipeline = matchedModel === "Gemini 3 Flash Preview";
                        leaderboardMap[matchedModel] = {
                            score: score,
                            status: isPipeline ? "pipeline" : "success",
                            label: score.toFixed(2)
                        };
                    }
                }
            } catch(e) {}
        }
    });

    const rowsHtml = Object.entries(leaderboardMap)
        .sort((a, b) => {
            const order: Record<string, number> = { "pipeline": 0, "success": 1, "error": 2, "untested": 3 };
            if (order[a[1].status] !== order[b[1].status]) {
                return order[a[1].status] - order[b[1].status];
            }
            return b[1].score - a[1].score;
        })
        .map(([model, meta]) => {
            const widthPct = meta.status === 'untested' || meta.status === 'error' ? 10 : (meta.score * 100);
            return `
                <div class="model-row ${meta.status}">
                    <div class="model-name">${model}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${widthPct}%;"></div>
                        <span class="bar-label">${meta.label}</span>
                    </div>
                </div>
            `;
        }).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: var(--vscode-font-family, sans-serif);
                    font-size: var(--vscode-font-size, 13px);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 24px;
                }
                h1 { font-size: 20px; font-weight: 500; margin-bottom: 4px; color: var(--vscode-settings-headerForeground); }
                p { color: var(--vscode-descriptionForeground); margin-bottom: 12px; font-size: 12px; }
                .debug-box { background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.15); padding: 12px; margin-bottom: 16px; border-radius: 4px; font-family: monospace; font-size: 11px; line-height: 1.6; }
                
                /* Calendar Ledger Styles */
                .calendar-container { margin-bottom: 24px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 6px; }
                .cal-grid { display: flex; gap: 8px; flex-wrap: wrap; }
                .cal-day { background: rgba(76, 175, 80, 0.15); border: 1px solid rgba(76, 175, 80, 0.3); padding: 8px 12px; border-radius: 4px; text-align: center; font-size: 11px; }
                
                .matrix-container { display: flex; flex-direction: column; gap: 6px; max-width: 900px; }
                .model-row { display: grid; grid-template-columns: 240px 1fr; align-items: center; background: var(--vscode-list-hoverBackground); padding: 6px 12px; border-radius: 4px; border-left: 4px solid #A0A0A0; }
                .model-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .bar-container { display: flex; align-items: center; gap: 12px; width: 100%; }
                .bar { height: 14px; border-radius: 2px; transition: width 0.4s ease-in-out; }
                .bar-label { font-size: 11px; opacity: 0.85; }
                .pipeline { border-left-color: #FFD700; background: rgba(255, 215, 0, 0.05); }
                .pipeline .bar { background: #FFD700; }
                .pipeline .model-name { color: #FFD700; }
                .success { border-left-color: #1f77b4; }
                .success .bar { background: #1f77b4; }
                .error { border-left-color: #D32F2F; background: rgba(211, 47, 47, 0.05); }
                .error .bar { background: #D32F2F; opacity: 0.3; width: 10% !important; }
                .error .bar-label { color: #f44336; font-weight: bold; }
                .error .model-name { color: #f44336; }
                .untested { border-left-color: #555555; opacity: 0.4; }
                .untested .bar { background: #444444; }
            </style>
        </head>
        <body>
            <h1>Pencil Physics: Dev Tool Integration Board</h1>
            <p>Native evaluation coverage matrix streaming directly from local environment directories.</p>
            
            <div class="debug-box">
                ${debugStatus}
            </div>

            ${calendarHtml}

            <div class="matrix-container">
                ${rowsHtml}
            </div>
        </body>
        </html>
    `;
}
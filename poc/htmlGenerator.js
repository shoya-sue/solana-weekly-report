// HTML report generator for GitHub Pages

export function generateHTMLReport(markdownContent, charts = []) {
  // Convert markdown to HTML (simplified)
  let htmlContent = markdownContent
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Convert markdown tables to HTML
  htmlContent = convertTables(htmlContent);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Wallet Report</title>
    <style>
        :root {
            --primary-color: #9333ea;
            --secondary-color: #10b981;
            --danger-color: #ef4444;
            --bg-color: #f9fafb;
            --text-color: #1f2937;
            --border-color: #e5e7eb;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: var(--text-color);
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .report-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: var(--text-color);
            font-size: 1.8rem;
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border-color);
        }
        
        h3 {
            color: var(--text-color);
            font-size: 1.3rem;
            margin: 1.5rem 0 0.75rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            overflow-x: auto;
            display: block;
        }
        
        th {
            background: var(--primary-color);
            color: white;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        tr:hover {
            background: #f3f4f6;
        }
        
        a {
            color: var(--primary-color);
            text-decoration: none;
            transition: color 0.2s;
        }
        
        a:hover {
            color: #7c3aed;
            text-decoration: underline;
        }
        
        code {
            background: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
        }
        
        .success {
            color: var(--secondary-color);
        }
        
        .failed {
            color: var(--danger-color);
        }
        
        .chart-container {
            margin: 2rem 0;
            text-align: center;
            background: var(--bg-color);
            padding: 1rem;
            border-radius: 8px;
        }
        
        .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .stat-card {
            background: var(--bg-color);
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }
        
        .wallet-section {
            margin: 2rem 0;
            padding: 1.5rem;
            background: #fafafa;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }
        
        .timestamp {
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            h1 {
                font-size: 1.8rem;
            }
            
            table {
                font-size: 0.9rem;
            }
            
            td, th {
                padding: 0.5rem;
            }
        }
        
        .nav-menu {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .nav-menu ul {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
        }
        
        .nav-menu a {
            padding: 0.5rem 1rem;
            background: var(--bg-color);
            border-radius: 4px;
            transition: all 0.2s;
        }
        
        .nav-menu a:hover {
            background: var(--primary-color);
            color: white;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="report-card">
            ${htmlContent}
        </div>
    </div>
</body>
</html>`;

  return html;
}

function convertTables(content) {
  // Simple markdown table to HTML converter
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
  
  return content.replace(tableRegex, (match, header, body) => {
    const headers = header.split('|').filter(h => h.trim());
    const rows = body.trim().split('\n').map(row => 
      row.split('|').filter(cell => cell.trim())
    );
    
    let html = '<table><thead><tr>';
    headers.forEach(h => {
      html += `<th>${h.trim()}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        // Check for success/failure indicators
        let cellContent = cell.trim();
        if (cellContent.includes('✅')) {
          cellContent = cellContent.replace('✅', '<span class="success">✅</span>');
        }
        if (cellContent.includes('❌')) {
          cellContent = cellContent.replace('❌', '<span class="failed">❌</span>');
        }
        html += `<td>${cellContent}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
  });
}

export function generateIndexPage(reports) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Wallet Reports - Dashboard</title>
    <style>
        :root {
            --primary-color: #9333ea;
            --secondary-color: #10b981;
            --bg-gradient-start: #667eea;
            --bg-gradient-end: #764ba2;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .report-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
        }
        
        .report-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        }
        
        .report-title {
            font-size: 1.3rem;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .report-date {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .report-stats {
            display: flex;
            justify-content: space-between;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .stat-label {
            font-size: 0.8rem;
            color: #6b7280;
        }
        
        .view-button {
            display: block;
            width: 100%;
            padding: 0.75rem;
            margin-top: 1rem;
            background: var(--primary-color);
            color: white;
            text-align: center;
            border-radius: 6px;
            text-decoration: none;
            transition: background 0.2s;
        }
        
        .view-button:hover {
            background: #7c3aed;
        }
        
        .latest-badge {
            display: inline-block;
            background: var(--secondary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .reports-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🌐 Solana Wallet Reports</h1>
            <p>Automated weekly transaction reports powered by GitHub Actions</p>
        </div>
        
        <div class="reports-grid">
            ${reports.map((report, index) => `
            <div class="report-card" onclick="window.location.href='${report.filename}'">
                <h2 class="report-title">
                    ${report.title}
                    ${index === 0 ? '<span class="latest-badge">Latest</span>' : ''}
                </h2>
                <div class="report-date">📅 ${report.date}</div>
                <div class="report-stats">
                    <div class="stat">
                        <div class="stat-value">${report.transactions || 0}</div>
                        <div class="stat-label">Transactions</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${report.wallets || 0}</div>
                        <div class="stat-label">Wallets</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${report.charts || 0}</div>
                        <div class="stat-label">Charts</div>
                    </div>
                </div>
                <a href="${report.filename}" class="view-button">View Report →</a>
            </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 3rem; color: white; opacity: 0.8;">
            <p>Powered by Solana Web3.js • Updated weekly via GitHub Actions</p>
            <p style="margin-top: 0.5rem;">
                <a href="https://github.com/YOUR_USERNAME/solana-weekly-report" style="color: white;">
                    View on GitHub
                </a>
            </p>
        </div>
    </div>
</body>
</html>`;

  return html;
}
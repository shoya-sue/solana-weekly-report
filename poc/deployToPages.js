#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTMLReport, generateIndexPage } from './htmlGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deployToGitHubPages() {
  console.log('🚀 Starting GitHub Pages deployment preparation...\n');
  
  try {
    // Create docs directory for GitHub Pages
    const docsDir = path.join(__dirname, '..', 'docs');
    const reportsDir = path.join(__dirname, 'reports');
    const chartsDir = path.join(reportsDir, 'charts');
    
    // Create docs directory
    await fs.mkdir(docsDir, { recursive: true });
    await fs.mkdir(path.join(docsDir, 'charts'), { recursive: true });
    
    // Read all markdown reports
    const files = await fs.readdir(reportsDir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`Found ${markdownFiles.length} reports to convert...\n`);
    
    const reports = [];
    
    // Convert each markdown report to HTML
    for (const mdFile of markdownFiles) {
      console.log(`Converting ${mdFile}...`);
      
      const mdPath = path.join(reportsDir, mdFile);
      const mdContent = await fs.readFile(mdPath, 'utf8');
      
      // Extract metadata from markdown
      const titleMatch = mdContent.match(/^# (.+)$/m);
      const title = titleMatch ? titleMatch[1] : 'Solana Wallet Report';
      
      const dateMatch = mdContent.match(/Period: (.+?) ~/);
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
      
      const txMatch = mdContent.match(/Total Transactions[^:]*: (\d+)/);
      const transactions = txMatch ? parseInt(txMatch[1]) : 0;
      
      const walletsMatch = mdContent.match(/Monitored Wallets[^:]*: (\d+)/);
      const wallets = walletsMatch ? parseInt(walletsMatch[1]) : 0;
      
      // Count charts
      const chartFiles = await fs.readdir(chartsDir).catch(() => []);
      const charts = chartFiles.length;
      
      // Load SVG charts for this report if they exist
      const reportCharts = [];
      try {
        const chartFiles = await fs.readdir(chartsDir);
        for (const chartFile of chartFiles) {
          if (chartFile.endsWith('.svg')) {
            const svgContent = await fs.readFile(path.join(chartsDir, chartFile), 'utf8');
            reportCharts.push({
              filename: chartFile,
              content: svgContent
            });
          }
        }
      } catch (error) {
        console.log('No charts found for this report');
      }
      
      // Generate HTML with embedded charts
      const htmlContent = generateHTMLReport(mdContent, reportCharts);
      const htmlFile = mdFile.replace('.md', '.html');
      const htmlPath = path.join(docsDir, htmlFile);
      
      await fs.writeFile(htmlPath, htmlContent, 'utf8');
      
      reports.push({
        filename: htmlFile,
        title: title.replace(/# /, ''),
        date,
        transactions,
        wallets,
        charts
      });
    }
    
    // Copy charts to docs directory
    try {
      const chartFiles = await fs.readdir(chartsDir);
      for (const chartFile of chartFiles) {
        const srcPath = path.join(chartsDir, chartFile);
        const destPath = path.join(docsDir, 'charts', chartFile);
        await fs.copyFile(srcPath, destPath);
      }
      console.log(`\nCopied ${chartFiles.length} charts to docs/charts/`);
    } catch (error) {
      console.log('No charts to copy (charts directory may not exist)');
    }
    
    // Generate index page
    console.log('\nGenerating index page...');
    reports.sort((a, b) => b.date.localeCompare(a.date)); // Sort by date, newest first
    const indexHtml = generateIndexPage(reports);
    await fs.writeFile(path.join(docsDir, 'index.html'), indexHtml, 'utf8');
    
    // Create .nojekyll file to bypass Jekyll processing
    await fs.writeFile(path.join(docsDir, '.nojekyll'), '', 'utf8');
    
    // Create CNAME file if custom domain is needed (optional)
    // await fs.writeFile(path.join(docsDir, 'CNAME'), 'your-domain.com', 'utf8');
    
    console.log('\n✅ GitHub Pages deployment preparation complete!');
    console.log(`📁 Files generated in: ${docsDir}`);
    console.log('\nNext steps:');
    console.log('1. Commit and push the docs/ directory');
    console.log('2. Go to Settings > Pages in your GitHub repository');
    console.log('3. Set Source to "Deploy from a branch"');
    console.log('4. Select "main" branch and "/docs" folder');
    console.log('5. Your site will be available at: https://YOUR_USERNAME.github.io/solana-weekly-report/\n');
    
  } catch (error) {
    console.error('❌ Error during deployment preparation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  deployToGitHubPages();
}

export { deployToGitHubPages };
// Simple SVG chart generator for transaction analytics

export function generateTransactionChart(transactions, title = 'Transaction Activity') {
  if (!transactions || transactions.length === 0) return '';
  
  // Group transactions by day
  const dailyData = {};
  
  transactions.forEach(tx => {
    const date = tx.blockTime.toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        count: 0,
        volume: 0,
        fees: 0,
        success: 0,
        failed: 0
      };
    }
    
    dailyData[date].count++;
    dailyData[date].volume += Math.abs(tx.balanceChange || 0);
    dailyData[date].fees += tx.fee || 0;
    
    if (tx.success) {
      dailyData[date].success++;
    } else {
      dailyData[date].failed++;
    }
  });
  
  // Convert to sorted array
  const sortedDates = Object.keys(dailyData).sort();
  const dataPoints = sortedDates.map(date => ({
    date,
    ...dailyData[date]
  }));
  
  // Generate SVG bar chart
  return generateBarChartSVG(dataPoints, title);
}

function generateBarChartSVG(dataPoints, title) {
  const width = 800;
  const height = 400;
  const padding = 60;
  const barWidth = Math.min((width - 2 * padding) / dataPoints.length - 5, 50);
  
  const maxCount = Math.max(...dataPoints.map(d => d.count));
  const yScale = (height - 2 * padding) / maxCount;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  
  <!-- Title -->
  <text x="${width/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">${title}</text>
  
  <!-- Y-axis -->
  <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
  
  <!-- X-axis -->
  <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
  
  <!-- Y-axis labels -->`;
  
  // Add Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = Math.round(maxCount * (5 - i) / 5);
    const y = padding + (i * (height - 2 * padding) / 5);
    svg += `
  <text x="${padding - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">${value}</text>
  <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
  }
  
  svg += `
  
  <!-- Bars -->`;
  
  // Add bars and labels
  dataPoints.forEach((data, index) => {
    const x = padding + 20 + index * ((width - 2 * padding) / dataPoints.length);
    const barHeight = data.count * yScale;
    const y = height - padding - barHeight;
    
    // Success bar (green)
    const successHeight = data.success * yScale;
    const successY = height - padding - successHeight;
    
    svg += `
  <!-- Bar ${index} -->
  <rect x="${x}" y="${successY}" width="${barWidth}" height="${successHeight}" fill="#10b981" opacity="0.8"/>`;
    
    // Failed bar (red) - stacked on top of success
    if (data.failed > 0) {
      const failedHeight = data.failed * yScale;
      const failedY = successY - failedHeight;
      svg += `
  <rect x="${x}" y="${failedY}" width="${barWidth}" height="${failedHeight}" fill="#ef4444" opacity="0.8"/>`;
    }
    
    // Date label (rotated)
    const dateStr = data.date.substring(5); // MM-DD
    svg += `
  <text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#666" transform="rotate(-45 ${x + barWidth/2} ${height - padding + 20})">${dateStr}</text>`;
    
    // Value label on top of bar
    if (data.count > 0) {
      svg += `
  <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#333">${data.count}</text>`;
    }
  });
  
  // Legend
  svg += `
  
  <!-- Legend -->
  <rect x="${width - 150}" y="${padding}" width="15" height="15" fill="#10b981" opacity="0.8"/>
  <text x="${width - 130}" y="${padding + 12}" font-size="12" fill="#666">Success</text>
  
  <rect x="${width - 150}" y="${padding + 25}" width="15" height="15" fill="#ef4444" opacity="0.8"/>
  <text x="${width - 130}" y="${padding + 37}" font-size="12" fill="#666">Failed</text>`;
  
  svg += `
</svg>`;
  
  return svg;
}

export function generateVolumeChart(transactions) {
  if (!transactions || transactions.length === 0) return '';
  
  // Group by day and calculate SOL volume
  const dailyVolume = {};
  
  transactions.forEach(tx => {
    const date = tx.blockTime.toISOString().split('T')[0];
    if (!dailyVolume[date]) {
      dailyVolume[date] = {
        inflow: 0,
        outflow: 0,
        net: 0
      };
    }
    
    const change = tx.balanceChange || 0;
    if (change > 0) {
      dailyVolume[date].inflow += change;
    } else {
      dailyVolume[date].outflow += Math.abs(change);
    }
    dailyVolume[date].net += change;
  });
  
  // Convert to sorted array
  const sortedDates = Object.keys(dailyVolume).sort();
  const dataPoints = sortedDates.map(date => ({
    date,
    ...dailyVolume[date]
  }));
  
  return generateLineChartSVG(dataPoints, 'Daily SOL Flow');
}

function generateLineChartSVG(dataPoints, title) {
  const width = 800;
  const height = 400;
  const padding = 60;
  
  // Find max values for scaling
  const allValues = dataPoints.flatMap(d => [d.inflow, d.outflow]);
  const maxValue = Math.max(...allValues, 0.001); // Minimum scale
  const yScale = (height - 2 * padding) / maxValue;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  
  <!-- Title -->
  <text x="${width/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">${title}</text>
  
  <!-- Axes -->
  <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>
  <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333" stroke-width="2"/>`;
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue * (5 - i) / 5).toFixed(4);
    const y = padding + (i * (height - 2 * padding) / 5);
    svg += `
  <text x="${padding - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">${value}</text>
  <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>`;
  }
  
  // Calculate points
  const xStep = (width - 2 * padding) / (dataPoints.length - 1 || 1);
  
  // Inflow line (green)
  const inflowPoints = dataPoints.map((d, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (d.inflow * yScale);
    return `${x},${y}`;
  }).join(' ');
  
  // Outflow line (red)
  const outflowPoints = dataPoints.map((d, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (d.outflow * yScale);
    return `${x},${y}`;
  }).join(' ');
  
  svg += `
  
  <!-- Lines -->
  <polyline points="${inflowPoints}" fill="none" stroke="#10b981" stroke-width="2"/>
  <polyline points="${outflowPoints}" fill="none" stroke="#ef4444" stroke-width="2"/>`;
  
  // Add points and labels
  dataPoints.forEach((d, i) => {
    const x = padding + i * xStep;
    const yIn = height - padding - (d.inflow * yScale);
    const yOut = height - padding - (d.outflow * yScale);
    
    svg += `
  <circle cx="${x}" cy="${yIn}" r="4" fill="#10b981"/>
  <circle cx="${x}" cy="${yOut}" r="4" fill="#ef4444"/>`;
    
    // Date label
    const dateStr = d.date.substring(5);
    svg += `
  <text x="${x}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#666" transform="rotate(-45 ${x} ${height - padding + 20})">${dateStr}</text>`;
  });
  
  // Legend
  svg += `
  
  <!-- Legend -->
  <line x1="${width - 150}" y1="${padding + 5}" x2="${width - 120}" y2="${padding + 5}" stroke="#10b981" stroke-width="2"/>
  <text x="${width - 115}" y="${padding + 10}" font-size="12" fill="#666">Inflow</text>
  
  <line x1="${width - 150}" y1="${padding + 25}" x2="${width - 120}" y2="${padding + 25}" stroke="#ef4444" stroke-width="2"/>
  <text x="${width - 115}" y="${padding + 30}" font-size="12" fill="#666">Outflow</text>`;
  
  svg += `
</svg>`;
  
  return svg;
}

export function generateTypePieChart(typeCounts) {
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Calculate total and percentages
  const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return '';
  
  // Define colors for each type
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  
  <!-- Title -->
  <text x="${centerX}" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Transaction Types</text>`;
  
  let currentAngle = -90; // Start at top
  const entries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  
  entries.forEach(([type, count], index) => {
    const percentage = count / total;
    const angle = percentage * 360;
    const color = colors[index % colors.length];
    
    // Calculate path for pie slice
    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    svg += `
  <!-- ${type}: ${count} (${(percentage * 100).toFixed(1)}%) -->
  <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" 
        fill="${color}" opacity="0.8" stroke="#fff" stroke-width="2"/>`;
    
    // Add percentage label if significant
    if (percentage > 0.05) {
      const labelAngleRad = ((currentAngle + angle/2) * Math.PI) / 180;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelAngleRad);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelAngleRad);
      
      svg += `
  <text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">${(percentage * 100).toFixed(0)}%</text>`;
    }
    
    currentAngle += angle;
  });
  
  // Legend
  let legendY = 80;
  entries.slice(0, 8).forEach(([type, count], index) => {
    const color = colors[index % colors.length];
    const percentage = ((count / total) * 100).toFixed(1);
    
    svg += `
  <rect x="20" y="${legendY}" width="15" height="15" fill="${color}" opacity="0.8"/>
  <text x="40" y="${legendY + 12}" font-size="11" fill="#666">${type} (${count}, ${percentage}%)</text>`;
    
    legendY += 20;
  });
  
  svg += `
</svg>`;
  
  return svg;
}
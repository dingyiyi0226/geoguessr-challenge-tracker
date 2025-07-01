const fs = require('fs');
const path = require('path');

// Read minified code from stdin
let minifiedCode = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  minifiedCode += chunk;
});

process.stdin.on('end', () => {
  // Add javascript: prefix to make it a proper bookmarklet
  const bookmarkletCode = `javascript:${minifiedCode.trim()}`;
  
  // Create the module content - use regular string with proper escaping
  const escapedCode = bookmarkletCode
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/`/g, '\\`')    // Escape backticks  
    .replace(/\$/g, '\\$');  // Escape dollar signs

  const moduleContent = `// Auto-generated - do not edit manually
// Run 'yarn build-bookmarklet' to update this file
export const BOOKMARKLET_CODE = \`${escapedCode}\`;
`;

  // Write to src/utils/bookmarklet.js
  const outputPath = path.join('src', 'utils', 'bookmarklet.js');
  fs.writeFileSync(outputPath, moduleContent);
  
  console.log('✅ Bookmarklet module generated at', outputPath);
  console.log(`📊 Size: ${bookmarkletCode.length} bytes`);
});

process.stdin.on('error', (error) => {
  console.error('❌ Error reading input:', error);
  process.exit(1);
}); 
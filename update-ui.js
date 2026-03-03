const fs = require('fs');
const path = require('path');

const files = [
  'app/layout.tsx',
  'components/Sidebar.tsx',
  'app/page.tsx',
  'app/products/page.tsx',
  'app/invoices/page.tsx',
  'app/invoice/new/page.tsx',
  'app/invoices/[id]/page.tsx'
];

const replacements = [
  // Typography/Layout
  [/rounded-2xl/g, 'rounded-xl'],
  [/shadow-xl/g, 'shadow-sm'],
  
  // Specific gradients & Sidebar
  [/bg-gradient-to-b from-amber-900 to-amber-800/g, 'bg-zinc-950 border-r border-zinc-800'],
  [/text-amber-50/g, 'text-white'],
  [/bg-amber-400 text-amber-900 shadow-md/g, 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'],
  
  // Dashboard Specific Colors
  [/bg-orange-100 text-orange-700/g, 'bg-zinc-100 text-zinc-700'],
  [/bg-orange-200/g, 'bg-zinc-200'],
  [/bg-yellow-100 text-yellow-700/g, 'bg-zinc-100 text-zinc-700'],
  [/bg-yellow-200/g, 'bg-zinc-200'],
  [/bg-lime-100 text-lime-700/g, 'bg-zinc-100 text-zinc-700'],
  [/bg-lime-200/g, 'bg-zinc-200'],
  
  // Colors mapped to professional Zinc
  [/amber-900/g, 'zinc-900'],
  [/amber-800/g, 'zinc-900'], // Primary actions
  [/amber-700/g, 'zinc-700'],
  [/amber-600/g, 'zinc-600'],
  [/amber-500/g, 'zinc-500'],
  [/amber-400/g, 'zinc-400'],
  [/amber-300/g, 'zinc-300'],
  [/amber-200/g, 'zinc-200'],
  [/amber-100/g, 'zinc-100'],
  [/amber-50/g, 'zinc-50'],
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

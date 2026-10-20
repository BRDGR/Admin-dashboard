#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Resolve typescript compiler
let ts;
try {
  ts = require("typescript");
} catch (_err) {
  // Fall back to local node_modules in AdminDashboard if not installed in parent path
  try {
    const adminTs = path.resolve(__dirname, "../node_modules/typescript");
    ts = require(adminTs);
  } catch (err) {
    console.error("Error: 'typescript' package not found. Run 'npm install' first.", err);
    process.exit(1);
  }
}

/**
 * Checks whether a ConditionalExpression node is nested inside another ConditionalExpression.
 *
 * Types of nesting:
 * - "Chained / Strict": Directly in test, consequent, or alternate (including parens).
 *   Example: `a ? b : c ? d : e` or `a ? (b ? c : d) : e`
 * - "JSX / Expression": Inside a JSX element, child tag, or function call that is itself
 *   inside an outer ternary branch before any new function/component boundary.
 *   Example: `isReady ? <div>{hasError ? <Error /> : <Data />}</div> : <Skeleton />`
 */
function analyzeNesting(node) {
  let p = node.parent;
  let isStrict = false;
  let hasOuterTernary = false;
  let depth = 0;

  // Walk up AST
  while (p) {
    // A new function/arrow/method scope resets the nesting context
    if (
      ts.isFunctionDeclaration(p) ||
      ts.isFunctionExpression(p) ||
      ts.isArrowFunction(p) ||
      ts.isMethodDeclaration(p)
    ) {
      break;
    }

    if (p.kind === ts.SyntaxKind.ConditionalExpression) {
      depth++;
      hasOuterTernary = true;

      // Check if strict (immediate parent or separated only by parens)
      let inner = node.parent;
      while (inner && inner.kind === ts.SyntaxKind.ParenthesizedExpression) {
        inner = inner.parent;
      }
      if (inner === p) {
        isStrict = true;
      }
    }
    p = p.parent;
  }

  if (!hasOuterTernary) return null;
  return {
    depth,
    type: isStrict ? "Chained/Strict" : "JSX/Expression-Nested",
  };
}

function checkFile(filePath, deepScan = false) {
  const content = fs.readFileSync(filePath, "utf-8");
  const isTsx = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
  let sf;
  try {
    sf = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
  } catch (_parseErr) {
    // Ignore files that cannot be parsed as valid TypeScript or JavaScript AST
    return [];
  }

  const results = [];

  function visit(node) {
    if (node.kind === ts.SyntaxKind.ConditionalExpression) {
      const nesting = analyzeNesting(node);
      if (nesting) {
        if (deepScan || nesting.type === "Chained/Strict") {
          const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart());
          const fullSnippet = node.getText(sf).replace(/\s+/g, " ").trim();
          const snippet = fullSnippet.length > 95 ? fullSnippet.slice(0, 92) + "..." : fullSnippet;
          results.push({
            file: filePath,
            line: line + 1,
            col: character + 1,
            depth: nesting.depth,
            type: nesting.type,
            snippet,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return results;
}

function scanPath(targetPath, deepScan = false) {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (/\.(ts|tsx|js|jsx)$/.test(targetPath)) {
      return checkFile(targetPath, deepScan);
    }
    return [];
  }

  let all = [];
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (["node_modules", ".next", ".git", ".gemini", "dist", "build", "coverage"].includes(entry.name)) {
      continue;
    }
    const full = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      all = all.concat(scanPath(full, deepScan));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      all = all.concat(checkFile(full, deepScan));
    }
  }
  return all;
}

function main() {
  const args = process.argv.slice(2);
  const deepScan = args.includes("--deep") || args.includes("--all");
  const target = args.find((a) => !a.startsWith("--")) || process.cwd();
  const absoluteTarget = path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    console.error(`Target path does not exist: ${target}`);
    process.exit(1);
  }

  const modeLabel = deepScan ? "DEEP (chained + JSX/expression nested)" : "STRICT (chained ternaries)";
  console.log(`\n🔍 Checking for nested ternaries [Mode: ${modeLabel}] in: ${path.relative(process.cwd(), absoluteTarget) || "."}`);
  const issues = scanPath(absoluteTarget, deepScan);

  if (issues.length === 0) {
    console.log("✅ No nested ternary operators found! Clean codebase.\n");
    process.exit(0);
  }

  // Group by file
  const grouped = {};
  for (const issue of issues) {
    const relFile = path.relative(process.cwd(), issue.file);
    if (!grouped[relFile]) grouped[relFile] = [];
    grouped[relFile].push(issue);
  }

  const strictCount = issues.filter((i) => i.type === "Chained/Strict").length;
  const jsxCount = issues.filter((i) => i.type !== "Chained/Strict").length;

  console.log(
    `\n⚠️  Found ${issues.length} nested ternary operator(s) (${strictCount} strict chained, ${jsxCount} JSX/expression nested) across ${Object.keys(grouped).length} file(s):\n`
  );

  for (const [file, items] of Object.entries(grouped)) {
    console.log(`📄 ${file} (${items.length}):`);
    for (const item of items) {
      const typeTag = deepScan ? `[${item.type}] ` : "";
      console.log(`   Line ${item.line}:${item.col}  ${typeTag}->  ${item.snippet}`);
    }
    console.log("");
  }

  process.exit(1);
}

main();

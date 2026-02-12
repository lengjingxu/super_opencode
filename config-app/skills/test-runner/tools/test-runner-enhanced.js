#!/usr/bin/env node
/**
 * Enhanced Test Runner - 增强版测试执行工具
 * 
 * 改进点:
 * 1. 深度内容验证 (不只检查章节存在)
 * 2. 交叉验证 (Phase N 必须覆盖 Phase N-1 的内容)
 * 3. 量化指标检查 (最小用例数、覆盖率等)
 * 4. Agent 审查集成建议
 */

const fs = require('fs');
const path = require('path');

const PHASES = {
  1: { name: '代码分析', output: 'CODE_ANALYSIS.md' },
  2: { name: '测试规划', output: 'TEST_PLAN.md' },
  3: { name: '测试生成', output: 'tests/' },
  4: { name: '验证执行', output: 'COVERAGE_REPORT.md' }
};

// 增强的验证规则
const ENHANCED_VALIDATIONS = {
  1: {
    required_sections: ['## 源代码文件清单', '## 统计'],
    content_patterns: [
      { regex: /\|\s*导出名称\s*\|\s*类型\s*\|/i, error: '缺少函数签名表格' },
      { regex: /总文件数[：:]\s*(\d+)/i, extract: 'total_files', min: 1, error: '缺少或无效的文件统计' },
      { regex: /总函数数[：:]\s*(\d+)/i, extract: 'total_functions', min: 1, error: '缺少或无效的函数统计' },
    ],
    cross_validation: null, // Phase 1 无前置依赖
    agent_review: {
      recommended: true,
      agent: 'momus',
      prompt: '审查 CODE_ANALYSIS.md: 1) 是否覆盖所有源文件? 2) 函数签名是否完整? 3) 复杂度评估是否合理?'
    }
  },
  2: {
    required_sections: ['## L1 单元测试计划', '## TODO 清单'],
    content_patterns: [
      { regex: /\|\s*用例ID\s*\|\s*描述\s*\|/i, error: '缺少测试用例表格' },
      { regex: /- \[ \] L1:/g, count: true, min: 3, error: 'TODO 清单项少于 3 个' },
      { regex: /\|\s*U\d+\s*\|/g, count: true, min: 5, error: '测试用例少于 5 个' },
    ],
    cross_validation: {
      source: 'CODE_ANALYSIS.md',
      check: 'functions_covered', // 检查是否覆盖了分析中的函数
      error: '测试计划未覆盖 CODE_ANALYSIS.md 中的所有函数'
    },
    agent_review: {
      recommended: true,
      agent: 'oracle',
      prompt: '审查 TEST_PLAN.md: 1) 测试策略是否合理? 2) 边界条件是否充分? 3) 优先级划分是否正确?'
    }
  },
  3: {
    required_sections: null, // 检查目录而非文件
    dir_validation: {
      min_files: 1,
      file_patterns: ['test_*.py', '*.test.js', '*.spec.js'],
      error: '测试目录为空或无有效测试文件'
    },
    cross_validation: {
      source: 'TEST_PLAN.md',
      check: 'todos_implemented', // 检查 TODO 是否都实现了
      error: 'TEST_PLAN.md 中的 TODO 未全部实现'
    },
    execution_check: {
      commands: {
        python: 'python -m pytest tests/ --collect-only',
        javascript: 'npm test -- --listTests'
      },
      error: '测试文件存在语法错误，无法执行'
    }
  },
  4: {
    required_sections: ['## 总体覆盖率', '## 测试结果'],
    content_patterns: [
      { regex: /通过[：:]\s*(\d+)/i, extract: 'passed', min: 1, error: '缺少通过用例数' },
      { regex: /\|\s*(?:Statements|Lines|Functions)\s*\|\s*(\d+)%/i, extract: 'coverage', min: 60, error: '覆盖率低于 60%' },
    ],
    cross_validation: {
      source: 'TEST_PLAN.md',
      check: 'all_executed', // 检查计划的用例是否都执行了
      error: '部分计划的测试用例未执行'
    },
    quality_gate: {
      coverage_target: 80,
      pass_rate_target: 95,
      action_on_fail: 'return_to_phase_2'
    }
  }
};

function validatePhaseEnhanced(phase, projectPath) {
  const config = ENHANCED_VALIDATIONS[phase];
  const phaseInfo = PHASES[phase];
  const errors = [];
  const warnings = [];
  const metrics = {};

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 深度验证阶段 ${phase}: ${phaseInfo.name}`);
  console.log('='.repeat(60));

  // 1. 检查产出物存在
  const outputPath = path.join(projectPath, phaseInfo.output);
  if (phase === 3) {
    if (!fs.existsSync(outputPath) || fs.readdirSync(outputPath).length === 0) {
      errors.push(`❌ 测试目录不存在或为空: ${outputPath}`);
      return { valid: false, errors, warnings, metrics };
    }
  } else {
    if (!fs.existsSync(outputPath)) {
      errors.push(`❌ 产出物不存在: ${outputPath}`);
      return { valid: false, errors, warnings, metrics };
    }
  }
  console.log(`✅ 产出物存在: ${phaseInfo.output}`);

  // 2. 检查必需章节
  if (config.required_sections) {
    const content = fs.readFileSync(outputPath, 'utf-8');
    for (const section of config.required_sections) {
      if (!content.includes(section)) {
        errors.push(`❌ 缺少必需章节: "${section}"`);
      } else {
        console.log(`✅ 章节存在: ${section}`);
      }
    }
  }

  // 3. 深度内容验证
  if (config.content_patterns && phase !== 3) {
    const content = fs.readFileSync(outputPath, 'utf-8');
    for (const pattern of config.content_patterns) {
      const matches = content.match(pattern.regex);
      
      if (pattern.count) {
        const count = matches ? matches.length : 0;
        metrics[pattern.extract || 'count'] = count;
        if (count < pattern.min) {
          errors.push(`❌ ${pattern.error} (当前: ${count}, 最小: ${pattern.min})`);
        } else {
          console.log(`✅ 数量检查通过: ${count} >= ${pattern.min}`);
        }
      } else if (pattern.extract) {
        if (matches && matches[1]) {
          const value = parseInt(matches[1]);
          metrics[pattern.extract] = value;
          if (value < pattern.min) {
            errors.push(`❌ ${pattern.error} (当前: ${value}, 最小: ${pattern.min})`);
          } else {
            console.log(`✅ ${pattern.extract}: ${value}`);
          }
        } else {
          errors.push(`❌ ${pattern.error}`);
        }
      } else {
        if (!matches) {
          errors.push(`❌ ${pattern.error}`);
        } else {
          console.log(`✅ 格式检查通过`);
        }
      }
    }
  }

  // 4. 交叉验证
  if (config.cross_validation) {
    const sourcePath = path.join(projectPath, config.cross_validation.source);
    if (fs.existsSync(sourcePath)) {
      const crossResult = performCrossValidation(
        config.cross_validation.check,
        sourcePath,
        outputPath,
        projectPath
      );
      if (!crossResult.valid) {
        warnings.push(`⚠️  ${config.cross_validation.error}`);
        warnings.push(`   详情: ${crossResult.details}`);
      } else {
        console.log(`✅ 交叉验证通过: ${config.cross_validation.check}`);
      }
    }
  }

  // 5. Agent 审查建议
  if (config.agent_review && config.agent_review.recommended) {
    console.log(`\n💡 建议: 调用 ${config.agent_review.agent} 进行质量审查`);
    console.log(`   prompt: "${config.agent_review.prompt}"`);
  }

  // 6. 质量门禁
  if (config.quality_gate && metrics.coverage) {
    if (metrics.coverage < config.quality_gate.coverage_target) {
      warnings.push(`⚠️  覆盖率 ${metrics.coverage}% 低于目标 ${config.quality_gate.coverage_target}%`);
      warnings.push(`   建议: 返回阶段 2 补充测试计划`);
    }
  }

  // 输出结果
  console.log('\n' + '-'.repeat(60));
  if (errors.length > 0) {
    console.log('❌ 验证失败:');
    errors.forEach(e => console.log(`   ${e}`));
  }
  if (warnings.length > 0) {
    console.log('⚠️  警告:');
    warnings.forEach(w => console.log(`   ${w}`));
  }
  if (errors.length === 0) {
    console.log('✅ 阶段验证通过');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics
  };
}

function performCrossValidation(checkType, sourcePath, targetPath, projectPath) {
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  
  switch (checkType) {
    case 'functions_covered': {
      // 从 CODE_ANALYSIS.md 提取函数名
      const funcMatches = sourceContent.match(/\|\s*(\w+)\s*\|\s*function\s*\|/gi) || [];
      const functions = funcMatches.map(m => m.match(/\|\s*(\w+)\s*\|/)[1]);
      
      // 检查 TEST_PLAN.md 是否覆盖
      const targetContent = fs.readFileSync(targetPath, 'utf-8');
      const uncovered = functions.filter(f => !targetContent.includes(f));
      
      return {
        valid: uncovered.length === 0,
        details: uncovered.length > 0 ? `未覆盖函数: ${uncovered.join(', ')}` : ''
      };
    }
    
    case 'todos_implemented': {
      // 从 TEST_PLAN.md 提取 TODO
      const todoMatches = sourceContent.match(/- \[ \] L\d+:\s*(\S+)/g) || [];
      const todos = todoMatches.map(m => m.match(/L\d+:\s*(\S+)/)[1]);
      
      // 检查测试文件是否存在
      const testsDir = path.join(projectPath, 'tests');
      if (!fs.existsSync(testsDir)) return { valid: false, details: '测试目录不存在' };
      
      const testFiles = fs.readdirSync(testsDir).join(' ');
      const unimplemented = todos.filter(t => !testFiles.toLowerCase().includes(t.toLowerCase()));
      
      return {
        valid: unimplemented.length <= todos.length * 0.2, // 允许 20% 未实现
        details: unimplemented.length > 0 ? `未实现: ${unimplemented.join(', ')}` : ''
      };
    }
    
    case 'all_executed': {
      // 从 TEST_PLAN.md 提取计划的测试用例数
      const plannedMatches = sourceContent.match(/\|\s*U\d+\s*\|/g) || [];
      const plannedCount = plannedMatches.length;
      
      // 从 COVERAGE_REPORT.md 提取实际执行的用例数
      const targetContent = fs.readFileSync(targetPath, 'utf-8');
      const executedMatch = targetContent.match(/总用例数[：:]\s*(\d+)/i);
      const executedCount = executedMatch ? parseInt(executedMatch[1]) : 0;
      
      return {
        valid: executedCount >= plannedCount * 0.8, // 允许 20% 偏差
        details: `计划: ${plannedCount}, 执行: ${executedCount}`
      };
    }
    
    default:
      return { valid: true, details: '' };
  }
}

function generateAgentReviewPrompt(phase, projectPath) {
  const config = ENHANCED_VALIDATIONS[phase];
  if (!config.agent_review) return null;
  
  const phaseInfo = PHASES[phase];
  const outputPath = path.join(projectPath, phaseInfo.output);
  
  return `
## Agent 审查请求

**阶段**: ${phase} - ${phaseInfo.name}
**文档**: ${phaseInfo.output}
**审查 Agent**: ${config.agent_review.agent}

### 审查要点
${config.agent_review.prompt}

### 调用方式
\`\`\`
delegate_task(
  subagent_type="${config.agent_review.agent}",
  load_skills=[],
  prompt="""
  审查文件: ${outputPath}
  
  ${config.agent_review.prompt}
  
  输出格式:
  1. 通过/不通过
  2. 具体问题列表
  3. 改进建议
  """,
  run_in_background=false
)
\`\`\`
`;
}

// CLI
const [,, command, arg1, arg2] = process.argv;
const projectPath = arg2 || arg1 || process.cwd();

switch (command) {
  case 'validate':
  case 'check':
    const result = validatePhaseEnhanced(parseInt(arg1), projectPath);
    process.exit(result.valid ? 0 : 1);
    break;
    
  case 'review-prompt':
    const prompt = generateAgentReviewPrompt(parseInt(arg1), projectPath);
    if (prompt) console.log(prompt);
    break;
    
  case 'status':
    console.log('\n📊 测试流程状态 (增强版)\n');
    for (const [phase, info] of Object.entries(PHASES)) {
      const result = validatePhaseEnhanced(parseInt(phase), projectPath);
      const status = result.valid ? '✅ 通过' : (result.errors.length > 0 ? '❌ 失败' : '⚠️ 警告');
      console.log(`\n阶段 ${phase}: ${info.name} - ${status}`);
    }
    break;
    
  default:
    console.log(`
增强版测试执行工具

用法:
  node test-runner-enhanced.js validate <phase> [project-path]  深度验证阶段
  node test-runner-enhanced.js review-prompt <phase> [project-path]  生成审查提示
  node test-runner-enhanced.js status [project-path]  查看整体状态

改进点:
  - 深度内容验证 (不只检查章节存在)
  - 交叉验证 (Phase N 覆盖 Phase N-1)
  - 量化指标检查 (最小用例数、覆盖率)
  - Agent 审查集成建议
`);
}

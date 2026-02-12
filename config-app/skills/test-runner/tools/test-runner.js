#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PHASES = {
  1: { name: '代码分析', output: 'CODE_ANALYSIS.md' },
  2: { name: '测试规划', output: 'TEST_PLAN.md' },
  3: { name: '测试生成', output: '__tests__/' },
  4: { name: '验证执行', output: 'COVERAGE_REPORT.md' }
};

function showPhase(phase, projectPath) {
  const phaseInfo = PHASES[phase];
  if (!phaseInfo) {
    console.log('❌ 无效阶段，可选: 1, 2, 3, 4');
    process.exit(1);
  }

  const templatePath = path.join(__dirname, '..', 'phases', `phase-${phase}.md`);
  if (!fs.existsSync(templatePath)) {
    console.log(`❌ 阶段模板不存在: ${templatePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(templatePath, 'utf-8');
  content = content.replace(/\{PROJECT_PATH\}/g, projectPath || '.');
  
  console.log('\n' + '='.repeat(60));
  console.log(`📋 阶段 ${phase}: ${phaseInfo.name}`);
  console.log('='.repeat(60));
  console.log(content);
}

function checkPhase(phase, projectPath) {
  const phaseInfo = PHASES[phase];
  const outputPath = path.join(projectPath, phaseInfo.output);
  
  console.log(`\n🔍 检查阶段 ${phase} 产出物: ${phaseInfo.output}`);
  
  if (phase === 3) {
    if (fs.existsSync(outputPath) && fs.readdirSync(outputPath).length > 0) {
      console.log('✅ 测试文件已生成');
      return true;
    }
  } else {
    if (fs.existsSync(outputPath)) {
      const content = fs.readFileSync(outputPath, 'utf-8');
      const validations = getValidations(phase);
      const missing = validations.filter(v => !content.includes(v));
      
      if (missing.length === 0) {
        console.log(`✅ ${phaseInfo.output} 验证通过`);
        return true;
      } else {
        console.log(`❌ ${phaseInfo.output} 缺少必需章节:`);
        missing.forEach(m => console.log(`   - "${m}"`));
        return false;
      }
    }
  }
  
  console.log(`❌ 产出物不存在: ${outputPath}`);
  return false;
}

function getValidations(phase) {
  const rules = {
    1: ['## 源代码文件清单', '## 统计'],
    2: ['## L1 单元测试计划', '## TODO 清单'],
    4: ['## 总体覆盖率', '## 测试结果']
  };
  return rules[phase] || [];
}

function nextPhase(currentPhase, projectPath) {
  if (!checkPhase(currentPhase, projectPath)) {
    console.log(`\n⚠️  请先完成阶段 ${currentPhase} 的产出物`);
    process.exit(1);
  }
  
  const next = currentPhase + 1;
  if (next > 4) {
    console.log('\n🎉 所有阶段已完成！');
    process.exit(0);
  }
  
  console.log(`\n✅ 阶段 ${currentPhase} 完成，进入阶段 ${next}`);
  showPhase(next, projectPath);
}

function showStatus(projectPath) {
  console.log('\n📊 测试流程状态\n');
  
  for (const [phase, info] of Object.entries(PHASES)) {
    const outputPath = path.join(projectPath, info.output);
    let status = '⬚ 未开始';
    
    if (phase == 3) {
      if (fs.existsSync(outputPath) && fs.readdirSync(outputPath).length > 0) {
        status = '✅ 已完成';
      }
    } else if (fs.existsSync(outputPath)) {
      status = '✅ 已完成';
    }
    
    console.log(`  阶段 ${phase}: ${info.name.padEnd(8)} ${status}`);
  }
  console.log('');
}

const [,, command, arg1, arg2] = process.argv;
const projectPath = arg2 || arg1 || process.cwd();

switch (command) {
  case 'start':
  case 'phase':
    showPhase(parseInt(arg1) || 1, projectPath);
    break;
  case 'check':
    checkPhase(parseInt(arg1), projectPath);
    break;
  case 'next':
    nextPhase(parseInt(arg1), projectPath);
    break;
  case 'status':
    showStatus(projectPath);
    break;
  default:
    console.log(`
测试执行工具 - 渐进式流程控制

用法:
  node test-runner.js start [phase] [project-path]  开始指定阶段
  node test-runner.js check <phase> [project-path]  检查阶段产出物
  node test-runner.js next <phase> [project-path]   完成当前阶段，进入下一阶段
  node test-runner.js status [project-path]         查看整体进度

示例:
  node test-runner.js start 1 ./my-project   # 开始阶段1
  node test-runner.js check 1 ./my-project   # 检查阶段1产出物
  node test-runner.js next 1 ./my-project    # 验证阶段1并进入阶段2
`);
}

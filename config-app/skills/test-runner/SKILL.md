---
name: test-runner
description: 测试执行框架 - 多代理协作完成代码分析、测试规划、测试生成、验证执行
version: 2.0.0
triggers:
  - 运行测试
  - 测试
  - pytest
  - jest
  - 单元测试
  - 集成测试
  - E2E测试
  - 添加测试
  - 创建测试
  - 测试覆盖

outputs:
  - name: CODE_ANALYSIS.md
    phase: 1
    required: true
    description: 代码分析报告 - 列出所有源文件、函数签名、复杂度
    validation:
      - contains: "## 源代码文件清单"
      - contains: "## 统计"
      - matches: "\\| 导出名称 \\| 类型 \\|"
      - matches: "总文件数[：:]\\s*\\d+"
      - matches: "总函数数[：:]\\s*\\d+"
    min_functions: 5
    agent_review:
      agent: momus
      required: false
      prompt: "审查 CODE_ANALYSIS.md: 1) 是否覆盖所有源文件? 2) 函数签名是否完整? 3) 复杂度评估是否合理?"

  - name: TEST_PLAN.md
    phase: 2
    required: true
    description: 测试计划 - 为每个函数规划测试用例
    validation:
      - contains: "## L1 单元测试计划"
      - contains: "## TODO 清单"
      - matches: "\\| 用例ID \\| 描述 \\|"
    min_test_cases: 10
    cross_validation:
      source: CODE_ANALYSIS.md
      check: functions_covered
      error: "测试计划未覆盖 CODE_ANALYSIS.md 中的所有函数"
    agent_review:
      agent: oracle
      required: false
      prompt: "审查 TEST_PLAN.md: 1) 测试策略是否合理? 2) 边界条件是否充分? 3) 优先级划分是否正确?"

  - name: tests/
    phase: 3
    required: true
    description: 测试代码目录
    validation:
      - min_files: 1
      - file_patterns: ["test_*.py", "*.test.js", "*.spec.js"]
    cross_validation:
      source: TEST_PLAN.md
      check: todos_implemented
      error: "TEST_PLAN.md 中的 TODO 未全部实现"
    execution_check:
      python: "python -m pytest tests/ --collect-only"
      javascript: "npm test -- --listTests"

  - name: COVERAGE_REPORT.md
    phase: 4
    required: true
    description: 覆盖率报告 - 测试执行结果和覆盖率分析
    validation:
      - contains: "## 总体覆盖率"
      - contains: "## 测试结果"
      - matches: "通过[：:]\\s*\\d+"
    quality_gate:
      coverage_target: 80
      pass_rate_target: 95
      action_on_fail: return_to_phase_2
    agent_review:
      agent: momus
      required: false
      prompt: "审查 COVERAGE_REPORT.md: 1) 数据是否准确? 2) 未覆盖代码分析是否到位? 3) 改进建议是否可行?"
---

# 测试执行 Skill v2.0 (增强版)

## 核心改进

**v2.0 新增**:
- ✅ 深度内容验证 (不只检查章节存在)
- ✅ 交叉验证 (Phase N 必须覆盖 Phase N-1)
- ✅ 量化指标检查 (最小用例数、覆盖率)
- ✅ Agent 审查集成 (Momus/Oracle 质量把关)
- ✅ 闭环机制 (不达标返回修改)

## 执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                    增强版测试流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: 代码分析                                          │
│      ↓                                                      │
│  [脚本验证] → 检查格式、章节、最小数量                        │
│      ↓                                                      │
│  [Agent 审查] → Momus 检查完整性 (推荐)                      │
│      ↓ (不通过则返回修改)                                    │
│                                                             │
│  Phase 2: 测试规划                                          │
│      ↓                                                      │
│  [脚本验证] → 检查格式、用例数量                             │
│      ↓                                                      │
│  [交叉验证] → 检查是否覆盖 Phase 1 的所有函数                 │
│      ↓                                                      │
│  [Agent 审查] → Oracle 检查策略合理性 (推荐)                 │
│      ↓ (不通过则返回修改)                                    │
│                                                             │
│  Phase 3: 测试生成                                          │
│      ↓                                                      │
│  [脚本验证] → 检查测试文件存在                               │
│      ↓                                                      │
│  [交叉验证] → 检查是否实现 Phase 2 的所有 TODO               │
│      ↓                                                      │
│  [执行验证] → 运行测试，确保语法正确                         │
│      ↓ (不通过则返回修改)                                    │
│                                                             │
│  Phase 4: 验证执行                                          │
│      ↓                                                      │
│  [脚本验证] → 检查报告格式                                   │
│      ↓                                                      │
│  [覆盖率检查] → 是否达到 80% 目标                            │
│      ↓ (不达标则返回 Phase 2 补充)                           │
│                                                             │
│  ✅ 完成                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 质量门禁

| 阶段 | 脚本验证 | 交叉验证 | Agent 审查 | 质量门禁 |
|------|----------|----------|------------|----------|
| 1 | ✅ 必须 | - | ⭐ 推荐 (Momus) | - |
| 2 | ✅ 必须 | ✅ 必须 | ⭐ 推荐 (Oracle) | - |
| 3 | ✅ 必须 | ✅ 必须 | - | 测试可运行 |
| 4 | ✅ 必须 | - | ⭐ 推荐 (Momus) | 覆盖率 ≥ 80% |

---

## 阶段1: 代码分析

### 目标
分析项目代码结构，识别所有需要测试的模块、函数、类。

### 执行指令
```
delegate_task(
  subagent_type="explore",
  run_in_background=false,
  load_skills=[],
  prompt="""
分析项目代码结构，生成 CODE_ANALYSIS.md 文档。

要求:
1. 列出所有源代码文件 (排除 node_modules, __pycache__, dist 等)
2. 对每个文件，提取:
   - 导出的函数/类/常量
   - 函数签名 (参数和返回值)
   - 复杂度评估 (低/中/高)
   - 外部依赖 (数据库/文件/网络/第三方API)
3. 识别关键用户流程 (用于 E2E 测试)
4. 输出格式见下方模板

项目路径: {PROJECT_PATH}
"""
)
```

### 输出文档: CODE_ANALYSIS.md

```markdown
# 代码分析报告

## 项目信息
- 项目名称: {PROJECT_NAME}
- 项目类型: {JavaScript/Python/Electron}
- 分析时间: {TIMESTAMP}

## 源代码文件清单

### {FILE_PATH_1}
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| functionA | function | (input: string) => boolean | 低 | 无 |
| functionB | function | (data: object) => Promise<Result> | 高 | 数据库 |

## 关键用户流程
1. **流程名称**: {name}
   - 入口: {file}
   - 涉及模块: {modules}

## 统计
- 总文件数: {N}
- 总函数数: {M}
- 高复杂度函数: {H}
```

### 质量验证

**脚本验证:**
```bash
node test-runner-enhanced.js validate 1 {PROJECT_PATH}
```

**Agent 审查 (推荐):**
```
delegate_task(
  subagent_type="momus",
  load_skills=[],
  prompt="""
审查 CODE_ANALYSIS.md:
1. 是否覆盖所有源文件?
2. 函数签名是否完整?
3. 复杂度评估是否合理?
4. 是否遗漏关键模块?

输出: 通过/不通过 + 具体问题列表
""",
  run_in_background=false
)
```

### 完成检查点
- [ ] CODE_ANALYSIS.md 已创建
- [ ] 包含 "## 源代码文件清单" 章节
- [ ] 包含 "## 统计" 章节
- [ ] 函数签名表格格式正确
- [ ] 脚本验证通过
- [ ] Agent 审查通过 (或记录豁免原因)

---

## 阶段2: 测试规划

### 目标
基于 CODE_ANALYSIS.md，制定详细的测试计划。

### 执行步骤
1. 读取 CODE_ANALYSIS.md
2. 为每个函数规划测试用例
3. 确定测试优先级
4. 生成 TEST_PLAN.md

### 输出文档: TEST_PLAN.md

```markdown
# 测试计划

## 基于代码分析
- 分析文档: CODE_ANALYSIS.md
- 规划时间: {TIMESTAMP}

## L1 单元测试计划

### {MODULE_NAME} ({FILE_PATH})

#### {FUNCTION_NAME}
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U001 | 正常输入 | `{input}` | `{output}` | 正常 |
| U002 | 空输入 | `null` | `{}` | 边界 |

## TODO 清单
- [ ] L1: {module} - {function} ({N} 用例)
- [ ] L2: {service} - CRUD ({N} 用例)

## 测试统计
| 层级 | 用例数 | P0 | P1 | P2 |
|------|--------|----|----|----| 
| L1 | N | | | |
| 总计 | N | | | |
```

### 质量验证

**脚本验证:**
```bash
node test-runner-enhanced.js validate 2 {PROJECT_PATH}
```

**交叉验证:** 自动检查是否覆盖 CODE_ANALYSIS.md 中的所有函数

**Agent 审查 (推荐):**
```
delegate_task(
  subagent_type="oracle",
  load_skills=[],
  prompt="""
审查 TEST_PLAN.md:
1. 测试策略是否合理?
2. 边界条件是否充分?
3. 优先级划分是否正确?
4. 是否遗漏关键测试场景?

输出: 通过/不通过 + 改进建议
""",
  run_in_background=false
)
```

### 完成检查点
- [ ] TEST_PLAN.md 已创建
- [ ] 包含 "## L1 单元测试计划" 章节
- [ ] 包含 "## TODO 清单" 章节
- [ ] 测试用例 ≥ 10 个
- [ ] 脚本验证通过
- [ ] 交叉验证通过 (覆盖所有分析的函数)
- [ ] Agent 审查通过 (或记录豁免原因)

---

## 阶段3: 测试生成

### 目标
根据 TEST_PLAN.md 生成测试代码。

### 执行指令
```
delegate_task(
  category="quick",
  run_in_background=true,
  load_skills=["test-runner"],
  prompt="""
根据测试计划生成测试代码。

模块: {MODULE_NAME}
测试用例: {PASTE_FROM_TEST_PLAN}

要求:
1. 为每个用例编写测试代码
2. 确保测试可独立运行
3. 添加必要的 setup/teardown
"""
)
```

### 质量验证

**脚本验证:**
```bash
node test-runner-enhanced.js validate 3 {PROJECT_PATH}
```

**交叉验证:** 自动检查是否实现 TEST_PLAN.md 中的所有 TODO

**执行验证:**
```bash
# Python
python -m pytest tests/ --collect-only

# JavaScript
npm test -- --listTests
```

### 完成检查点
- [ ] 测试文件已创建
- [ ] TEST_PLAN.md 中的 TODO 已全部实现
- [ ] 测试可运行 (语法正确)
- [ ] 脚本验证通过
- [ ] 交叉验证通过

---

## 阶段4: 验证执行

### 目标
运行测试，分析覆盖率，生成报告。

### 执行命令
```bash
# Python
pytest --cov=src --cov-report=term-missing

# JavaScript
npm run test:coverage
```

### 输出文档: COVERAGE_REPORT.md

```markdown
# 覆盖率报告

## 总体覆盖率
| 指标 | 覆盖率 | 目标 | 状态 |
|------|--------|------|------|
| Statements | X% | 80% | ✅/❌ |
| Lines | X% | 80% | ✅/❌ |

## 测试结果
- 总用例数: N
- 通过: N
- 失败: N
- 跳过: N

## 未覆盖代码
| 文件 | 行号 | 原因 | 建议 |
|------|------|------|------|

## 失败用例分析
| 用例 | 错误信息 | 建议修复 |
|------|----------|----------|
```

### 质量验证

**脚本验证:**
```bash
node test-runner-enhanced.js validate 4 {PROJECT_PATH}
```

**质量门禁:**
- 覆盖率 ≥ 80%
- 通过率 ≥ 95%
- 不达标则返回 Phase 2 补充测试

### 完成检查点
- [ ] 测试全部通过 (或记录失败原因)
- [ ] COVERAGE_REPORT.md 已创建
- [ ] 覆盖率达到 80% (或说明原因)
- [ ] 脚本验证通过

---

## 工具命令

```bash
# 验证指定阶段
node test-runner-enhanced.js validate <phase> <project-path>

# 生成 Agent 审查提示
node test-runner-enhanced.js review-prompt <phase> <project-path>

# 查看整体状态
node test-runner-enhanced.js status <project-path>
```

---

## 快速命令映射

| 用户请求 | 执行阶段 |
|----------|----------|
| "分析代码" | 阶段1 |
| "规划测试" | 阶段1 + 阶段2 |
| "生成测试" | 阶段1 + 阶段2 + 阶段3 |
| "运行测试" | 阶段4 |
| "完整测试流程" | 阶段1 → 2 → 3 → 4 |

---

## 支持的项目类型

| 检测文件 | 项目类型 | 测试框架 |
|----------|----------|----------|
| `package.json` + `electron` | Electron | Jest + Playwright |
| `package.json` | Node.js | Jest + Playwright |
| `pyproject.toml` / `setup.py` / `requirements.txt` | Python | pytest |

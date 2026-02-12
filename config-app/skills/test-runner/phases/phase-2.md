# 阶段 2: 测试规划 (REQUIRED)

## 前置条件
- ✅ CODE_ANALYSIS.md 已存在且验证通过

## 目标
基于代码分析，为每个函数规划具体测试用例。

## 执行步骤

1. 读取 CODE_ANALYSIS.md
2. 为每个函数规划测试用例:
   - 正常输入 → 期望输出
   - 边界条件 (空值、极值)
   - 错误处理 (无效输入)
3. 确定优先级: P0(核心) > P1(依赖) > P2(工具)

## 必需产出物

创建 `TEST_PLAN.md`，包含以下章节：

```markdown
# 测试计划

## 基于代码分析
- 分析文档: CODE_ANALYSIS.md
- 规划时间: {timestamp}

## L1 单元测试计划

### {module_name} ({file_path})

#### {function_name}
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U001 | 正常输入 | `{input}` | `{output}` | 正常 |
| U002 | 空输入 | `null` | `{}` | 边界 |

## L2 集成测试计划
(如有外部依赖)

## L3 E2E 测试计划
(如有用户流程)

## TODO 清单
- [ ] L1: {module} - {function} ({N} 用例)
- [ ] L2: {service} - CRUD ({N} 用例)
- [ ] L3: {flow} ({N} 用例)

## 测试统计
| 层级 | 用例数 | P0 | P1 | P2 |
|------|--------|----|----|----| 
| L1 | N | | | |
| 总计 | N | | | |
```

## 质量验证 (REQUIRED)

### 1. 脚本验证
```bash
node test-runner-enhanced.js validate 2 {PROJECT_PATH}
```

验证项:
- [ ] 文件存在
- [ ] 包含必需章节
- [ ] 测试用例表格格式正确
- [ ] 测试用例数 ≥ 10

### 2. 交叉验证 (自动)
检查是否覆盖 CODE_ANALYSIS.md 中的所有函数。

如有未覆盖函数，会提示:
```
⚠️ 测试计划未覆盖 CODE_ANALYSIS.md 中的所有函数
   未覆盖: funcA, funcB, ...
```

### 3. Agent 审查 (推荐)
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

输出格式:
- 通过/不通过
- 具体问题列表
- 改进建议
""",
  run_in_background=false
)
```

## 完成检查点

- [ ] TEST_PLAN.md 已创建
- [ ] 包含 "## L1 单元测试计划" 章节
- [ ] 包含 "## TODO 清单" 章节
- [ ] 每个函数都有测试用例
- [ ] 测试用例数 ≥ 10
- [ ] 脚本验证通过
- [ ] 交叉验证通过
- [ ] Agent 审查通过 (或记录豁免原因)

## 下一步

完成后执行: `node test-runner-enhanced.js validate 2 {PROJECT_PATH}`

验证通过后进入阶段 3。

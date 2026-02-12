# 阶段 4: 验证执行 (REQUIRED)

## 前置条件
- ✅ 测试文件已存在且验证通过

## 目标
运行测试，分析覆盖率，生成报告。

## 执行步骤

1. 运行测试并收集覆盖率
2. 分析未覆盖代码
3. 生成覆盖率报告

## 运行命令

### JavaScript
```bash
npm run test:coverage
```

### Python
```bash
pytest --cov=src --cov-report=term-missing
```

## 必需产出物

创建 `COVERAGE_REPORT.md`：

```markdown
# 覆盖率报告

## 执行信息
- 执行时间: {timestamp}
- 测试框架: {pytest/jest}
- 项目路径: {path}

## 总体覆盖率
| 指标 | 覆盖率 | 目标 | 状态 |
|------|--------|------|------|
| Statements | X% | 80% | ✅/❌ |
| Branches | X% | 70% | ✅/❌ |
| Functions | X% | 80% | ✅/❌ |
| Lines | X% | 80% | ✅/❌ |

## 测试结果
- 总用例数: N
- 通过: N
- 失败: N
- 跳过: N
- 通过率: X%

## 未覆盖代码
| 文件 | 行号 | 原因 | 建议 |
|------|------|------|------|
| {file} | {lines} | {reason} | {suggestion} |

## 失败用例分析
(如有失败)
| 用例 | 错误信息 | 建议修复 |
|------|----------|----------|

## 改进建议
1. {suggestion_1}
2. {suggestion_2}
```

## 质量验证 (REQUIRED)

### 1. 脚本验证
```bash
node test-runner-enhanced.js validate 4 {PROJECT_PATH}
```

验证项:
- [ ] 文件存在
- [ ] 包含必需章节
- [ ] 测试结果数据完整

### 2. 质量门禁
| 指标 | 目标 | 不达标处理 |
|------|------|------------|
| 覆盖率 | ≥ 80% | 返回阶段 2 补充测试 |
| 通过率 | ≥ 95% | 修复失败用例 |

如果覆盖率 < 80%:
```
⚠️ 覆盖率 65% 低于目标 80%
   建议: 返回阶段 2 补充测试计划
```

### 3. Agent 审查 (推荐)
```
delegate_task(
  subagent_type="momus",
  load_skills=[],
  prompt="""
审查 COVERAGE_REPORT.md:
1. 数据是否准确?
2. 未覆盖代码分析是否到位?
3. 改进建议是否可行?

输出格式:
- 通过/不通过
- 具体问题列表
- 改进建议
""",
  run_in_background=false
)
```

## 覆盖率不足处理

如果覆盖率 < 80%:
1. 分析未覆盖代码
2. 回到阶段 2 补充测试计划
3. 重新执行阶段 3、4

## 完成检查点

- [ ] 测试全部通过 (或记录失败原因)
- [ ] COVERAGE_REPORT.md 已创建
- [ ] 包含 "## 总体覆盖率" 章节
- [ ] 包含 "## 测试结果" 章节
- [ ] 覆盖率达到 80% (或说明原因并补充)
- [ ] 脚本验证通过
- [ ] Agent 审查通过 (或记录豁免原因)

## 完成

执行: `node test-runner-enhanced.js status {PROJECT_PATH}` 查看最终状态

所有阶段验证通过后，测试流程完成。

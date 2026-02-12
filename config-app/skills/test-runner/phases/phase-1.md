# 阶段 1: 代码分析 (REQUIRED)

## 目标
分析项目代码结构，识别所有需要测试的模块、函数、类。

## 执行步骤

1. 扫描源代码目录 (排除 node_modules, __pycache__, dist)
2. 提取每个文件的导出函数/类/常量
3. 记录函数签名、复杂度、外部依赖
4. 识别关键用户流程

## 必需产出物

创建 `CODE_ANALYSIS.md`，包含以下章节：

```markdown
# 代码分析报告

## 项目信息
- 项目名称: {name}
- 项目类型: {JavaScript/Python/Electron}
- 分析时间: {timestamp}

## 源代码文件清单

### {file_path}
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| funcA | function | (x: string) => boolean | 低 | 无 |

## 关键用户流程
1. **流程名称**: {name}
   - 入口: {file}
   - 涉及模块: {modules}

## 统计
- 总文件数: N
- 总函数数: M
- 高复杂度函数: H
```

## 质量验证 (REQUIRED)

### 1. 脚本验证
```bash
node test-runner-enhanced.js validate 1 {PROJECT_PATH}
```

验证项:
- [ ] 文件存在
- [ ] 包含必需章节
- [ ] 函数签名表格格式正确
- [ ] 统计数据完整

### 2. Agent 审查 (推荐)
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

输出格式:
- 通过/不通过
- 具体问题列表
- 改进建议
""",
  run_in_background=false
)
```

## 完成检查点

- [ ] CODE_ANALYSIS.md 已创建
- [ ] 包含 "## 源代码文件清单" 章节
- [ ] 包含 "## 统计" 章节
- [ ] 所有源文件已分析
- [ ] 脚本验证通过
- [ ] Agent 审查通过 (或记录豁免原因)

## 下一步

完成后执行: `node test-runner-enhanced.js validate 1 {PROJECT_PATH}`

验证通过后进入阶段 2。

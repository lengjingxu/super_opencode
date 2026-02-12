# 阶段 3: 测试生成

## 前置条件
- ✅ TEST_PLAN.md 已存在且验证通过

## 目标
根据测试计划，生成实际测试代码。

## 执行步骤

1. 读取 TEST_PLAN.md 中的 TODO 清单
2. 按模块生成测试文件
3. 每个测试用例对应一个 test case

## 测试文件结构

### JavaScript (Jest)
```
__tests__/
├── {module}.test.js
└── e2e/
    └── {flow}.e2e.js
```

### Python (pytest)
```
tests/
├── test_{module}.py
└── e2e/
    └── test_{flow}.py
```

## 测试代码模板

### Jest 单元测试
```javascript
const { funcA, funcB } = require('../lib/{module}');

describe('{module}', () => {
  describe('{function}', () => {
    test('U001: 正常输入返回正确结果', () => {
      expect(funcA({input})).toBe({output});
    });

    test('U002: 空输入返回默认值', () => {
      expect(funcA(null)).toEqual({});
    });
  });
});
```

### pytest 单元测试
```python
import pytest
from {module} import func_a

class TestFuncA:
    def test_u001_normal_input(self):
        assert func_a({input}) == {output}

    def test_u002_empty_input(self):
        assert func_a(None) == {}
```

## 质量验证 (REQUIRED)

### 1. 脚本验证
```bash
node test-runner-enhanced.js validate 3 {PROJECT_PATH}
```

验证项:
- [ ] 测试目录存在
- [ ] 测试文件数 ≥ 1
- [ ] 文件命名符合规范 (test_*.py / *.test.js)

### 2. 交叉验证 (自动)
检查是否实现 TEST_PLAN.md 中的所有 TODO。

如有未实现 TODO，会提示:
```
⚠️ TEST_PLAN.md 中的 TODO 未全部实现
   未实现: module_a, module_b, ...
```

### 3. 执行验证
确保测试文件语法正确，可以被测试框架识别:

```bash
# Python
python -m pytest tests/ --collect-only

# JavaScript
npm test -- --listTests
```

如有语法错误，会提示:
```
❌ 测试文件存在语法错误，无法执行
```

## 完成检查点

- [ ] 测试文件已创建 (__tests__/ 或 tests/)
- [ ] TEST_PLAN.md 中的 TODO 已全部实现
- [ ] 测试可运行 (npm test / pytest)
- [ ] 脚本验证通过
- [ ] 交叉验证通过
- [ ] 执行验证通过

## 下一步

完成后执行: `node test-runner-enhanced.js validate 3 {PROJECT_PATH}`

验证通过后进入阶段 4。

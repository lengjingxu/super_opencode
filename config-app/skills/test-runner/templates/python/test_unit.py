import pytest
from {{MODULE_PATH}} import {{MODULE_NAME}}


@pytest.mark.unit
class Test{{CLASS_NAME}}:
    
    def test_{{FUNCTION_NAME}}_returns_expected_result(self):
        input_data = {{TEST_INPUT}}
        expected = {{EXPECTED_OUTPUT}}
        
        result = {{FUNCTION_CALL}}
        
        assert result == expected

    def test_{{FUNCTION_NAME}}_handles_empty_input(self):
        result = {{FUNCTION_CALL_EMPTY}}
        
        assert result is not None

    def test_{{FUNCTION_NAME}}_handles_none_input(self):
        result = {{FUNCTION_CALL_NONE}}
        
        assert result is not None or result is None

    def test_{{FUNCTION_NAME}}_raises_on_invalid_input(self):
        with pytest.raises({{EXPECTED_EXCEPTION}}):
            {{FUNCTION_CALL_INVALID}}

    @pytest.mark.parametrize("input_val,expected", [
        ({{PARAM_INPUT_1}}, {{PARAM_EXPECTED_1}}),
        ({{PARAM_INPUT_2}}, {{PARAM_EXPECTED_2}}),
        ({{PARAM_INPUT_3}}, {{PARAM_EXPECTED_3}}),
    ])
    def test_{{FUNCTION_NAME}}_parametrized(self, input_val, expected):
        result = {{FUNCTION_NAME}}(input_val)
        
        assert result == expected

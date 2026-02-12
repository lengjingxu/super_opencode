import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
class TestE2E:
    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        page.goto("{{BASE_URL}}")
        page.wait_for_load_state("domcontentloaded")

    def test_page_loads_successfully(self, page: Page):
        expect(page).to_have_title("{{PAGE_TITLE}}")

    def test_navigation_visible(self, page: Page):
        nav = page.locator("nav, [role='navigation']").first
        expect(nav).to_be_visible()

    def test_main_content_visible(self, page: Page):
        main = page.locator("main, [role='main'], .main-content").first
        expect(main).to_be_visible()


@pytest.mark.e2e
class TestUserFlow:
    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        page.goto("{{BASE_URL}}")
        page.wait_for_load_state("domcontentloaded")

    def test_step_1(self, page: Page):
        page.click("{{STEP_1_SELECTOR}}")
        expect(page.locator("{{STEP_1_EXPECTED}}")).to_be_visible()

    def test_step_2(self, page: Page):
        page.fill("{{STEP_2_INPUT}}", "{{STEP_2_VALUE}}")
        page.click("{{STEP_2_SUBMIT}}")
        expect(page.locator("{{STEP_2_EXPECTED}}")).to_be_visible()

    def test_step_3(self, page: Page):
        expect(page.locator("{{STEP_3_SELECTOR}}")).to_contain_text("{{STEP_3_TEXT}}")


@pytest.mark.e2e
class TestFormValidation:
    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        page.goto("{{FORM_URL}}")
        page.wait_for_load_state("domcontentloaded")

    def test_empty_required_field_shows_error(self, page: Page):
        page.click("{{SUBMIT_BUTTON}}")
        expect(page.locator("{{ERROR_SELECTOR}}")).to_be_visible()

    def test_invalid_input_shows_error(self, page: Page):
        page.fill("{{INPUT_SELECTOR}}", "{{INVALID_INPUT}}")
        page.click("{{SUBMIT_BUTTON}}")
        expect(page.locator("{{ERROR_SELECTOR}}")).to_be_visible()

    def test_valid_input_submits_successfully(self, page: Page):
        page.fill("{{INPUT_SELECTOR}}", "{{VALID_INPUT}}")
        page.click("{{SUBMIT_BUTTON}}")
        expect(page.locator("{{SUCCESS_SELECTOR}}")).to_be_visible()


@pytest.mark.e2e
class TestResponsiveDesign:
    def test_mobile_layout(self, page: Page):
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto("{{BASE_URL}}")
        expect(page.locator("{{MOBILE_MENU}}")).to_be_visible()

    def test_tablet_layout(self, page: Page):
        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto("{{BASE_URL}}")
        expect(page.locator("{{CONTENT_SELECTOR}}")).to_be_visible()

    def test_desktop_layout(self, page: Page):
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto("{{BASE_URL}}")
        expect(page.locator("{{SIDEBAR_SELECTOR}}")).to_be_visible()

from playwright.sync_api import sync_playwright

def verify_admin_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})

        page = context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # Mock APIs
        page.route("**/*api/users/me/", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"id": 1, "username": "admin", "email": "admin@example.com", "user_type": "admin"}'
        ))

        page.route("**/*api/admin-dashboard/stats/", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"total_users": 100, "active_jobs": 5, "total_revenue": 5000, "pending_reports": 2, "recent_activity": []}'
        ))

        page.route("**/*api/admin/users/", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"results": [{"id": 1, "username": "admin", "email": "admin@example.com", "user_type": "admin", "credit_balance": 5, "is_active": true}, {"id": 2, "username": "student1", "email": "student1@example.com", "user_type": "student", "credit_balance": 10, "is_active": true}]}'
        ))

        page.route("**/*api/admin/gigs/", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"results": [{"id": 1, "title": "Math Tutor", "tutor": "tutor1", "subject": "Math", "is_active": true}, {"id": 2, "title": "Physics Tutor", "tutor": "tutor1", "subject": "Physics", "is_active": false}]}'
        ))

        # Mock user search
        page.route("**/*api/admin/users/?search=student1", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"results": [{"id": 2, "username": "student1", "email": "student1@example.com", "user_type": "student"}]}'
        ))

        # Mock delete
        page.route("**/*api/admin/users/2/", lambda route: route.fulfill(
             status=204
        ))

        # Inject token AND user before navigation
        print("Injecting token and user...")
        page.goto("http://localhost:3000/login") # Go to a page to set localstorage
        page.evaluate("localStorage.setItem('token', 'mock_token')")
        page.evaluate('localStorage.setItem("user", JSON.stringify({"id": 1, "username": "admin", "email": "admin@example.com", "user_type": "admin"}))')

        print("Navigating to dashboard...")
        page.goto("http://localhost:3000/dashboard")

        try:
            # 2. Click Users Tab
            print("Clicking Users...")
            page.click("text=Users", timeout=5000)
            page.wait_for_timeout(1000)

            # Test Delete Confirmation
            print("Clicking Delete on student1...")
            student_row = page.locator("tr", has_text="student1")
            student_row.locator("button[title='Delete']").click()

            page.wait_for_timeout(1000)
            page.screenshot(path="/home/jules/verification/admin_delete_confirm.png")
            print("Captured Delete Confirmation screenshot")

            # Verify modal text
            assert page.is_visible("text=Confirm Deletion")
            assert page.is_visible("text=Are you sure you want to delete this item?")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_state.png")

        browser.close()

if __name__ == "__main__":
    verify_admin_dashboard()

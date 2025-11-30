from playwright.sync_api import sync_playwright

def verify_issues():
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

        page.route("**/*api/admin/users/2/", lambda route: route.fulfill(status=204))

        # Inject token AND user
        page.goto("http://localhost:3000/login")
        page.evaluate("localStorage.setItem('token', 'mock_token')")
        page.evaluate('localStorage.setItem("user", JSON.stringify({"id": 1, "username": "admin", "email": "admin@example.com", "user_type": "admin"}))')

        print("Navigating to dashboard...")
        page.goto("http://localhost:3000/dashboard")

        try:
            print("Clicking Users...")
            page.click("text=Users", timeout=5000)
            page.wait_for_timeout(1000)

            # Check Credits column content
            print("Checking credits...")
            # We expect 'N/A' for admin and '10' for student1
            admin_row = page.locator("tr", has_text="admin")
            student_row = page.locator("tr", has_text="student1")

            admin_credits = admin_row.locator("td").nth(2).text_content()
            student_credits = student_row.locator("td").nth(2).text_content()
            print(f"Admin Credits: {admin_credits}")
            print(f"Student Credits: {student_credits}")

            # Test Delete Confirmation
            print("Clicking Delete on student1...")
            student_row.locator("button[title='Delete']").click()
            page.wait_for_timeout(1000)

            # Check if modal exists in DOM
            modal = page.locator("text=Confirm Deletion")
            if modal.count() > 0:
                print("Modal found in DOM.")
                if modal.is_visible():
                    print("Modal is visible.")
                else:
                    print("Modal is NOT visible.")
                    # print styles
                    print(modal.evaluate("el => window.getComputedStyle(el).display"))
            else:
                print("Modal NOT found in DOM.")
                page.screenshot(path="/home/jules/verification/no_modal.png")

        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    verify_issues()

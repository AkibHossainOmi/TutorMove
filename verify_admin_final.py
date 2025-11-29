import asyncio
import json
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Mock API responses
        # 1. User/Auth Mocks
        await page.route("**/api/users/me/", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": 1,
                "email": "admin@example.com",
                "first_name": "Admin",
                "last_name": "User",
                "user_type": "admin"
            })
        ))

        # 2. Stats Mocks for Admin Dashboard
        stats_response = json.dumps({"total": 10, "active": 5, "open": 5, "closed": 5})

        await page.route("**/api/admin/users/stats/", lambda route: route.fulfill(status=200, body=stats_response))
        await page.route("**/api/admin/jobs/stats/", lambda route: route.fulfill(status=200, body=stats_response))
        await page.route("**/api/admin/subjects/stats/", lambda route: route.fulfill(status=200, body=stats_response))
        await page.route("**/api/admin/gigs/stats/", lambda route: route.fulfill(status=200, body=stats_response))
        await page.route("**/api/admin/questions/stats/", lambda route: route.fulfill(status=200, body=stats_response))
        await page.route("**/api/admin/payments/stats/", lambda route: route.fulfill(status=200, body=stats_response))

        # 3. List Mocks (Empty lists to avoid errors)
        list_response = json.dumps({"results": [], "count": 0})
        await page.route("**/api/admin/users/*", lambda route: route.continue_() if "stats" in route.request.url else route.fulfill(status=200, body=list_response))
        await page.route("**/api/admin/jobs/*", lambda route: route.continue_() if "stats" in route.request.url else route.fulfill(status=200, body=list_response))
        await page.route("**/api/admin/subjects/*", lambda route: route.continue_() if "stats" in route.request.url else route.fulfill(status=200, body=list_response))

        # Pre-set LocalStorage
        # We need to navigate to the domain first to set localStorage for that domain
        await page.goto("http://localhost:3000/")

        await page.evaluate("""() => {
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify({
                id: 1,
                email: 'admin@example.com',
                user_type: 'admin'
            }));
        }""")

        # Now navigate to dashboard
        print("Navigating to Dashboard...")
        await page.goto("http://localhost:3000/dashboard")

        # Wait for something specific to Admin Dashboard
        # The tabs are: Users, Subjects, Gigs, Jobs, Questions, Payments
        try:
            # Wait for the main container or a specific tab
            await page.wait_for_selector("text=Overview", timeout=10000)
            print("Found 'Overview' text - Admin Dashboard Loaded!")

            # Check for stats badges
            stats = await page.locator("text=Total: 10").count()
            print(f"Found {stats} stats badges with value 10")

            # Check for Tabs
            tabs = ["Users", "Subjects", "Gigs", "Jobs", "Questions", "Payments"]
            for tab in tabs:
                if await page.get_by_text(tab).is_visible():
                    print(f"Tab '{tab}' is visible")
                else:
                    print(f"Tab '{tab}' NOT visible")

            print("Verification Successful")

        except Exception as e:
            print(f"Verification Failed: {e}")
            await page.screenshot(path="verify_fail.png")
            print("Screenshot saved to verify_fail.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

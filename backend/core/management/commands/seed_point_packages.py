from django.core.management.base import BaseCommand
from core.models import PointPackage

class Command(BaseCommand):
    help = "Seed point packages"

    def handle(self, *args, **kwargs):
        packages = [
            {"name": "Package 1", "base_points": 50, "bonus_points": 0, "price_usd": 1.00},
            {"name": "Package 2", "base_points": 100, "bonus_points": 5, "price_usd": 1.98},
            {"name": "Package 3", "base_points": 250, "bonus_points": 15, "price_usd": 4.90},
            {"name": "Package 4", "base_points": 500, "bonus_points": 40, "price_usd": 9.50},
            {"name": "Package 5", "base_points": 1000, "bonus_points": 100, "price_usd": 18.20},
            {"name": "Package 6", "base_points": 2500, "bonus_points": 300, "price_usd": 40.00},
            {"name": "Package 7", "base_points": 5000, "bonus_points": 800, "price_usd": 66.00},
            {"name": "Package 8", "base_points": 7500, "bonus_points": 1500, "price_usd": 85.00},
            {"name": "Package 9", "base_points": 10000, "bonus_points": 2000, "price_usd": 100.00},
        ]

        for pkg in packages:
            obj, created = PointPackage.objects.get_or_create(
                name=pkg["name"],
                defaults={
                    "base_points": pkg["base_points"],
                    "bonus_points": pkg["bonus_points"],
                    "price_usd": pkg["price_usd"],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {obj}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {obj}"))

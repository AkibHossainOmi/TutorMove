from django.core.management.base import BaseCommand
from core.models import UnlockPricingTier

class Command(BaseCommand):
    help = "Seed unlock pricing tiers"

    def handle(self, *args, **kwargs):
        tiers = [
            {"min_rate": 0, "max_rate": 5, "points": 100},
            {"min_rate": 6, "max_rate": 10, "points": 175},
            {"min_rate": 11, "max_rate": 15, "points": 250},
            {"min_rate": 16, "max_rate": 25, "points": 350},
            {"min_rate": 26, "max_rate": None, "points": 500},
        ]

        for tier in tiers:
            obj, created = UnlockPricingTier.objects.get_or_create(
                min_rate=tier["min_rate"],
                max_rate=tier["max_rate"],
                defaults={"points": tier["points"]},
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {obj}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {obj}"))

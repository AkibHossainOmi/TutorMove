from django.core.management.base import BaseCommand
from core.models import CountryGroupPoint

class Command(BaseCommand):
    help = "Seed default points for each country group"

    def handle(self, *args, **kwargs):
        data = [
            {"group": "G1", "points": 250},
            {"group": "G2", "points": 200},
            {"group": "G3", "points": 150},
            {"group": "G4", "points": 100},
            {"group": "G5", "points": 100},
        ]

        for entry in data:
            obj, created = CountryGroupPoint.objects.get_or_create(**entry)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created {obj}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {obj}"))

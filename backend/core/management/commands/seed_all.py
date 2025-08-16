from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Run all seeders: country groups, country group points, point packages, unlock pricing tiers"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Country Groups...")
        call_command("seed_country_groups")

        self.stdout.write("Seeding Country Group Points...")
        call_command("seed_country_group_points")

        self.stdout.write("Seeding Point Packages...")
        call_command("seed_point_packages")

        self.stdout.write("Seeding Unlock Pricing Tiers...")
        call_command("seed_unlock_pricing_tiers")

        self.stdout.write(self.style.SUCCESS("All seeders executed successfully!"))

from django.core.management.base import BaseCommand
from core.models import CountryGroup

class Command(BaseCommand):
    help = "Seed country groups with all specified countries"

    def handle(self, *args, **kwargs):
        groups = {
            "G1": [
                "United States", "United Kingdom", "Germany", "Australia", "Canada", "France", "Italy", "Japan",
                "Netherlands", "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria",
                "Ireland", "New Zealand", "Singapore", "Luxembourg", "Iceland", "Hong Kong", "United Arab Emirates",
                "Qatar", "Saudi Arabia", "Israel", "South Korea", "Andorra", "Monaco", "San Marino", "Liechtenstein",
                "Malta", "Brunei"
            ],
            "G2": [
                "China", "Brazil", "Russia", "Mexico", "Malaysia", "Turkey", "South Africa", "Argentina", "Chile",
                "Thailand", "Kazakhstan", "Romania", "Bulgaria", "Poland", "Hungary", "Czech Republic", "Slovakia",
                "Croatia", "Uruguay", "Costa Rica", "Panama", "Belarus", "Mauritius", "Montenegro", "Serbia",
                "Bosnia and Herzegovina", "North Macedonia", "Albania", "Armenia", "Georgia", "Azerbaijan", "Jordan",
                "Lebanon", "Maldives", "Fiji", "Seychelles"
            ],
            "G3": [
                "India", "Bangladesh", "Pakistan", "Vietnam", "Egypt", "Philippines", "Indonesia", "Morocco",
                "Sri Lanka", "Myanmar", "Nepal", "Cambodia", "Laos", "Ghana", "Nigeria", "Kenya", "Tanzania",
                "Uzbekistan", "Kyrgyzstan", "Mongolia", "Bolivia", "Honduras", "El Salvador", "Nicaragua",
                "Papua New Guinea", "Zimbabwe", "Zambia", "Cameroon", "Senegal", "Côte d'Ivoire", "Sudan",
                "Palestine", "Syria"
            ],
            "G4": [
                "Afghanistan", "Ethiopia", "Mozambique", "Haiti", "South Sudan", "Chad", "Central African Republic",
                "Somalia", "Niger", "Malawi", "Burundi", "Madagascar", "Liberia", "Sierra Leone", "Guinea", "Togo",
                "Burkina Faso", "Yemen", "Democratic Republic of the Congo", "Gambia", "Benin", "Mali", "Uganda",
                "Rwanda", "Eritrea"
            ],
            "G5": [
                "Greenland", "Western Sahara", "Guam", "Puerto Rico", "American Samoa", "French Polynesia",
                "New Caledonia", "Cayman Islands", "Bermuda", "British Virgin Islands", "Falkland Islands", "Gibraltar",
                "Jersey", "Guernsey", "Isle of Man", "Aruba", "Curaçao", "Bonaire", "Anguilla", "Montserrat",
                "Turks and Caicos Islands", "Saint Barthélemy", "Saint Martin", "Saint Pierre and Miquelon"
            ]
        }

        for group, countries in groups.items():
            for country in countries:
                CountryGroup.objects.get_or_create(
                    name=country,
                    defaults={"group": group}
                )

        self.stdout.write(self.style.SUCCESS("All country groups seeded successfully!"))

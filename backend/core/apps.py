from django.apps import AppConfig

class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        # core.signals module does not exist, commenting out to avoid error
        # import core.signals
        pass

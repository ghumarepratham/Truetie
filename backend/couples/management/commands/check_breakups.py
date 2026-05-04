from django.core.management.base import BaseCommand
from couples.utils import check_expired_breakups

class Command(BaseCommand):
    help = 'Check for expired relationship reactivation windows and permanently reset scores'

    def handle(self, *args, **options):
        count = check_expired_breakups()
        self.stdout.write(self.style.SUCCESS(f'Successfully processed {count} expired relationship archives.'))

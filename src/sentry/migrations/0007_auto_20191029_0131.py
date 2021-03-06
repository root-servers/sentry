# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Adding indexes to large tables. These indexes should be created concurrently,
    #   unfortunately we can't run migrations outside of a transaction until Django
    #   1.10. So until then these should be run manually.
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False


    dependencies = [
        ('sentry', '0006_sentryapp_date_published'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organization',
            name='default_role',
            field=models.CharField(default=b'member', max_length=32),
        ),
        migrations.AlterField(
            model_name='organizationmember',
            name='role',
            field=models.CharField(default=b'member', max_length=32),
        ),
    ]

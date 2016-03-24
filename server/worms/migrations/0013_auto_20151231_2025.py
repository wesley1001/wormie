# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-31 20:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worms', '0012_auto_20151231_1943'),
    ]

    operations = [
        migrations.RenameField(
            model_name='account',
            old_name='likes',
            new_name='submission_likes',
        ),
        migrations.AddField(
            model_name='account',
            name='wormhole_likes',
            field=models.ManyToManyField(related_name='likers', to='worms.Wormhole'),
        ),
    ]

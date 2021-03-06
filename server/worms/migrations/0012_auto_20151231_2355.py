# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-31 23:55
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worms', '0011_auto_20151229_0134'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='submission',
            options={'ordering': ('-created_at',)},
        ),
        migrations.AlterModelOptions(
            name='wormhole',
            options={'ordering': ('-created_at',)},
        ),
        migrations.RemoveField(
            model_name='submission',
            name='video_thumbnail',
        ),
        migrations.AlterField(
            model_name='wormhole',
            name='latitude',
            field=models.DecimalField(decimal_places=9, max_digits=11, validators=[django.core.validators.MinValueValidator(-90), django.core.validators.MaxValueValidator(90)]),
        ),
        migrations.AlterField(
            model_name='wormhole',
            name='longitude',
            field=models.DecimalField(decimal_places=9, max_digits=12, validators=[django.core.validators.MinValueValidator(-180), django.core.validators.MaxValueValidator(180)]),
        ),
    ]

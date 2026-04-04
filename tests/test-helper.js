import Application from 'modtest/app';
import config from 'modtest/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();

start();

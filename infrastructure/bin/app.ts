#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const backendStack = new BackendStack(app, 'PaymentCheckoutBackend', { env });
new FrontendStack(app, 'PaymentCheckoutFrontend', {
  env,
  apiUrl: backendStack.apiUrl,
});

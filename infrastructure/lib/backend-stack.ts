import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for RDS
    const vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Security group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: true,
    });

    // RDS PostgreSQL instance (free tier)
    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [dbSecurityGroup],
      databaseName: 'app_paid',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      publiclyAccessible: false,
    });

    // Lambda function for NestJS backend
    const backendFunction = new lambda.Function(this, 'BackendFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/main.handler',
      code: lambda.Code.fromAsset('../backend', {
        exclude: ['node_modules/.cache', 'coverage', '*.spec.ts'],
      }),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: `postgresql://postgres:${database.secret?.secretValueFromJson('password').unsafeUnwrap()}@${database.instanceEndpoint.hostname}:5432/app_paid`,
        PAYMENT_GATEWAY_API_URL: process.env.PAYMENT_GATEWAY_API_URL || '',
        PAYMENT_GATEWAY_PUBLIC_KEY: process.env.PAYMENT_GATEWAY_PUBLIC_KEY || '',
        PAYMENT_GATEWAY_PRIVATE_KEY: process.env.PAYMENT_GATEWAY_PRIVATE_KEY || '',
        PAYMENT_GATEWAY_INTEGRITY_KEY: process.env.PAYMENT_GATEWAY_INTEGRITY_KEY || '',
        BASE_FEE: '5000',
        DELIVERY_FEE: '10000',
      },
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Allow Lambda to connect to RDS
    database.connections.allowFrom(backendFunction, ec2.Port.tcp(5432));

    // API Gateway
    const api = new apigateway.LambdaRestApi(this, 'BackendApi', {
      handler: backendFunction,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    this.apiUrl = api.url;

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Backend API Gateway URL',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL Endpoint',
    });
  }
}

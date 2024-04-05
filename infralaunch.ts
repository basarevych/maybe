import { Config } from './.infralaunch/types/config'

const REGION = 'eu-west-1'
const DOMAIN = 'quick-test-domain.xyz'

/**
 * The config must be exported as "config"
 */
export const config: Config = {
  id: 'maybe',
  name: 'Maybe',
  environments: [
    {
      name: 'production',
      region: REGION,
      variables: {
        SMTP_PASSWORD: {
          type: 'secrets-manager',
        },
        SECRET_KEY_BASE: {
          type: 'secrets-manager',
        },
      },
      services: {
        network: {
          natGateway: true,
          availabilityZones: {
            [REGION]: [`${REGION}a`, `${REGION}b`],
          },
          jumpbox: {
            enable: true,
          },
        },
        database: [
          {
            id: 'database',
            type: 'aurora-postgres',
            skipFinalSnapshot: true,
            serverless: {
              enable: true,
              version: 2,
              instances: 1,
            },
            backups: {
              enable: true,
              type: 'snapshot',
              cron: '15 0 * * ? *',
            },
          },
        ],
        cache: [
          {
            id: 'redis',
            type: 'redis',
          },
        ],
        email: [
          {
            id: 'email',
            domain: {
              service: 'route53',
              existingHostedZone: true,
              domain: DOMAIN,
            },
          },
        ],
        server: [
          {
            id: 'server',
            instances: 1,
            docker: {
              build: {},
            },
            alb: {
              enable: true,
              internal: false,
              port: 3000,
              healthCheckPath: '/up',
            },
            securityRules: [
              {
                name: 'in-http',
                type: 'ingress',
                protocol: 'tcp',
                fromPort: 3000,
                toPort: 3000,
                cidrBlocks: ['0.0.0.0/0'],
              },
            ],
          },
        ],
        cdn: [
          {
            id: 'front',
            logRequests: true,
            domain: {
              service: 'route53',
              existingHostedZone: true,
              domain: DOMAIN,
              names: [DOMAIN],
            },
            behaviors: {
              default: {
                serverId: 'server',
                allowAllMethods: true,
                cachePolicy: {
                  type: 'predefined',
                  name: 'generic-server',
                },
              },
            },
          },
        ],
      },
    },
  ],
}

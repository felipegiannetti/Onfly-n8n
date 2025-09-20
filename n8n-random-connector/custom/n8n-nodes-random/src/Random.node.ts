import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

export class Random implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Random',
        name: 'random',
        icon: 'file:resources/random.svg',
        group: ['transform'],
        version: 1,
        description: 'True Random Number Generator using Random.org',
        defaults: {
            name: 'Random',
        },

        inputs: ['main'] as unknown as NodeConnectionType[],
        outputs: ['main'] as unknown as NodeConnectionType[],
        credentials: [],
        properties: [
        {
            displayName: 'Operation',
            name: 'operation',
            type: 'options',
            default: 'trng',
            options: [
                {
                    name: 'True Random Number Generator',
                    value: 'trng',
                    description: 'Generate a true random integer using Random.org',
                    action: 'Generate random integer',
                },
            ],
      },
      {
        displayName: 'Min',
        name: 'min',
        type: 'number',
        typeOptions: {
            minValue: Number.MIN_SAFE_INTEGER,
        },
        default: 1,
        description: 'Minimum integer (inclusive)',
        required: true,
      },
      {
        displayName: 'Max',
        name: 'max',
        type: 'number',
        typeOptions: {
            minValue: Number.MIN_SAFE_INTEGER,
        },
        default: 60,
        description: 'Maximum integer (inclusive)',
        required: true,
      },
    ],
  };

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const operation = this.getNodeParameter('operation', itemIndex) as string;

        if (operation !== 'trng') {
            throw new Error('Unsupported operation');
        }

        const min = this.getNodeParameter('min', itemIndex) as number;
        const max = this.getNodeParameter('max', itemIndex) as number;

        if (!Number.isInteger(min) || !Number.isInteger(max)) {
            throw new Error('Min and Max must be integers');
        }
        if (min > max) {
            throw new Error('Min must be less than or equal to Max');
        }

        const url = `https://www.random.org/integers/?num=1&min=${encodeURIComponent(
        min,
        )}&max=${encodeURIComponent(max)}&col=1&base=10&format=plain&rnd=new`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'n8n-random-node/1.0',
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Random.org request failed: ${res.status} ${res.statusText} - ${text}`);
        }

        const text = (await res.text()).trim();
        const value = Number(text);

        if (!Number.isInteger(value)) {
            throw new Error(`Invalid response from Random.org: ${text}`);
        }

        const out: IDataObject = {
            value,
            min,
            max,
            source: 'random.org',
        };

        returnData.push({ json: out });
    }

    return [returnData];
  }
}

export default Random;

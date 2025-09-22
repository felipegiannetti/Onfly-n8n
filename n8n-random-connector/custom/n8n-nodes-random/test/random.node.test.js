require('./setup');
const assert = require('node:assert');
const test = require('node:test');

const { Random } = require('../dist/Random.node.js');

function createExecuteContext(paramsPerItem) {
    return {
        getInputData() {
            return paramsPerItem.map(() => ({ json: {} }));
        },
        getNodeParameter(name, index) {
            return paramsPerItem[index][name];
        },
    };
}

test('integration: returns integer within [min,max]', async () => {
    const node = new Random();
    const ctx = createExecuteContext([{ operation: 'trng', min: 1, max: 10 }]);
    const out = await node.execute.call(ctx);
    assert.strictEqual(out.length, 1);
    assert.strictEqual(out[0].length, 1);
    const item = out[0][0];
    assert.strictEqual(typeof item.json.value, 'number');
    assert.ok(item.json.value >= 1 && item.json.value <= 10);
    assert.strictEqual(item.json.source, 'random.org');
});

test('validation: rejects non-integer parameters', async () => {
    const node = new Random();
    const ctx = createExecuteContext([{ operation: 'trng', min: 1.1, max: 10 }]);
    await assert.rejects(() => node.execute.call(ctx), /Min and Max must be integers/);
});

test('validation: rejects when min>max', async () => {
    const node = new Random();
    const ctx = createExecuteContext([{ operation: 'trng', min: 10, max: 1 }]);
    await assert.rejects(() => node.execute.call(ctx), /Min must be less than Max/);
});

test('integration: supports multiple input items', async () => {
    const node = new Random();
    const ctx = createExecuteContext([
        { operation: 'trng', min: 1, max: 3 },
        { operation: 'trng', min: 5, max: 7 },
    ]);
    const out = await node.execute.call(ctx);
    assert.strictEqual(out.length, 1);
    assert.strictEqual(out[0].length, 2);
    const [first, second] = out[0];
    assert.ok(first.json.value >= 1 && first.json.value <= 3);
    assert.ok(second.json.value >= 5 && second.json.value <= 7);
});

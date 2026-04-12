const suites = [
    require('./auth.use-cases.test.cjs'),
    require('./contact.use-cases.test.cjs'),
    require('./category.use-cases.test.cjs'),
];

let failures = 0;
let total = 0;

async function run(name, fn) {
    total += 1;

    try {
        await fn();
        console.log(`PASS ${name}`);
    } catch (error) {
        failures += 1;
        console.error(`FAIL ${name}`);
        console.error(error);
    }
}

(async () => {
    for (const suite of suites) {
        await suite(run);
    }

    console.log(`\n${total - failures}/${total} tests passed`);

    if (failures > 0) {
        process.exitCode = 1;
    }
})();

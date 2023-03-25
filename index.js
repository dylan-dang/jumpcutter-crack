import fetch from 'node-fetch';
import { parse } from 'yaml'
import { extractAll } from '@electron/asar';
import { env, exit, kill } from 'process';
import { join } from 'path';
import { createWriteStream, existsSync } from 'fs';
import { readFile, writeFile, unlink } from 'fs/promises';
import { exec, spawn } from 'child_process';
import { createHash } from 'crypto';

const host = 'https://jc-deployment-master.s3.amazonaws.com/';
const rootPath = join(env.LOCALAPPDATA, 'Programs', 'jc-electron');
const binPath = join(rootPath, 'JumpCutter.exe');
const appPath = join(rootPath, 'resources', 'app');
const htmlPath = join(appPath, 'app', 'renderer', 'index.html');
const asarPath = appPath + '.asar';

async function fetchLatest() {
    const req = await fetch(host + 'latest.yml');
    const text = await req.text();
    return parse(text);
}

async function download(fileName) {
    const output = createWriteStream(fileName, { flags: 'w' });
    const setup = await fetch(host + fileName);
    setup.body.pipe(output);
    return await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
    });

}

function install(fileName) {
    return new Promise((resolve, reject) => {
        const child = spawn(fileName, {
            stdio: 'ignore'
        });
        child.on('close', () => resolve());
        child.on('error', (err) => reject(err));
    })
}


function getPids(pattern) {
    return new Promise((resolve) => {
        exec("tasklist", (err, stdout, stderr) => {
            resolve(stdout.split("\r\n")
                .filter((line) => line.startsWith(pattern))
                .map((line) => parseInt(line.split(/\s+/)[1])));
        })
    })
}


function killProcess(pid, timeout = 10) {
    return new Promise((resolve, reject) => {
        let count = 0;
        const interval = setInterval(() => {
            try {
                kill(pid);
            } catch (e) {
                clearInterval(interval);
                resolve();
            }
            if (count++ > timeout) {
                clearInterval(interval);
                reject(new Error("Timeout process kill"))
            }
        }, 100);
    });
}

async function main() {
    if (!existsSync(asarPath)) {
        console.log('Fetching latest version...');
        const { path: setup, sha512: checkSum } = await fetchLatest();

        const hash = createHash('sha512');
        const hashDigest = await readFile(setup)
            .then((file) => (hash.update(file), hash.digest('base64')))
            .catch(() => null)

        if (hashDigest != checkSum) {
            if (hashDigest !== null) {
                console.log(`Could not verify integrity of locally downloaded setup file!`);
            }
            console.log(`Downloading ${setup}...`);
            await download(setup);
        }

        console.log(`Installing ${setup}...`);
        await install(setup);

        console.log('Killing JumpCutter...');
        await Promise.all((await getPids('JumpCutter.exe')).map((pid) => killProcess(pid)));
    }

    console.log('Extracting asar...');
    extractAll(asarPath, appPath);

    console.log('Injecting payload...');
    const htmlFile = await readFile(htmlPath, { encoding: 'utf-8' });
    await writeFile(htmlPath, htmlFile.replace('</head>', '<style>.contents>div{pointer-events:all !important;filter:none !important}body>div:nth-child(3){display:none}</style></head>'));
    await unlink(asarPath);

    console.log('Lauching JumpCutter...');
    spawn(binPath, {
        detached: true,
        stdio: 'ignore'
    }).unref();

    exit();
}


main();
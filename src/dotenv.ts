import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { parse } from 'dotenv';

const DOT_FILE_NAMES = ['.env.local', '.env', '.env.default'];

const DOT_FILE_ROOT_PATH = resolve(join(__dirname, '..'));

const { env: envs } = process;

for (const fileName of DOT_FILE_NAMES) {
  const filePath = join(DOT_FILE_ROOT_PATH, fileName);

  try {
    const fileContent = readFileSync(filePath, { encoding: 'utf8' });

    const parsed = parse(fileContent);
    const entries = Object.entries(parsed);

    for (const [key, value] of entries) {
      if (!envs[key]) {
        envs[key] = value;
      }
    }
  } catch (err) {
    //
  }
}

import { writeFile } from 'fs-extra';
import { format } from 'prettier';

export async function writeCode(file: string, content: string): Promise<void> {
  const data = await (format(content, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  }) as Promise<string>);

  await writeFile(file, data, {
    encoding: 'utf8',
  });
}

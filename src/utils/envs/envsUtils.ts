function getKey(...path: string[]): string {
  return path
    .join('_')
    .replace(/([A-Z][a-z])/g, (char) => `_${char}`)
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function getRaw(...path: string[]): string {
  const key = getKey(...path);

  return process.env[key] || null;
}

export function getAsUrl(...path: string[]): string {
  let result: string = null;

  try {
    const value = new URL(getRaw(...path));

    switch (value.protocol) {
      case 'http:':
      case 'https:':
      case 'ws:':
      case 'wss:':
        result = value.toString();
        break;
    }
  } catch (err) {
    //
  }

  return result;
}

export function getAsBool(...path: string[]): boolean {
  let result = false;

  try {
    const value = getRaw(...path).toLowerCase();

    switch (value.charAt(0)) {
      case '1':
      case 'y':
      case 't':
        result = true;
        break;
    }
  } catch (err) {
    //
  }

  return result;
}

export function getAsInt(...path: string[]): number {
  let result = 0;

  try {
    const value = parseInt(getRaw(...path), 10);

    if (value) {
      result = value;
    }
  } catch (err) {
    //
  }

  return result;
}

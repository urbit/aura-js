export function chunkFromRight(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array<string>(numChunks);

  for (let i = numChunks - 1, o = str.length; i >= 0; --i, o -= size) {
    let start = o - size;
    let len = size;
    if (start < 0) {
      start = 0;
      len = o;
    }
    chunks[i] = str.substr(start, len);
  }

  return chunks;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  let chunk: T[] = [];
  let newArray = [chunk];

  for (let i = 0; i < arr.length; i++) {
    if (chunk.length < size) {
      chunk.push(arr[i]);
    } else {
      chunk = [arr[i]];
      newArray.push(chunk);
    }
  }

  return newArray;
}

export function dropWhile<T>(arr: T[], pred: (x: T) => boolean): T[] {
  const newArray = arr.slice();

  for (const item of arr) {
    if (pred(item)) {
      newArray.shift();
    } else {
      return newArray;
    }
  }

  return newArray;
}

export function splitAt(index: number, str: string) {
  return [str.slice(0, index), str.slice(index)];
}

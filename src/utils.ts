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

export function splitAt(index: number, str: string) {
  return [str.slice(0, index), str.slice(index)];
}

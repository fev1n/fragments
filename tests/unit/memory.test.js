const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../src/model/data/memory/index');

describe('fragments-database', () => {
  //Using this to create randomized new Id's every time for ownerId and using under beforeEach() to create new instance of it to reduce misleading of data
  const createId = () => {
    let userID = 'user' + Date.now();
    return userID;
  };
  let ownerId;

  beforeEach(() => {
    ownerId = createId();
  });

  test('writeFragment() returns nothing', async () => {
    const fragment = { ownerId, id: 'b', content: 'temp-data' };
    const result = await writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() returns nothing', async () => {
    const id = 'b';
    const buffer = Buffer.from([1, 2, 3]);

    const result = await writeFragmentData(ownerId, id, buffer);
    expect(result).toBe(undefined);
  });

  test('writeFragment() updates the metadata if already exists for given ids', async () => {
    const fragment = { ownerId, id: 'b', value: 'temp-data' };
    await writeFragment(fragment);

    const fragment2 = { ...fragment, value: 'changed-data' };
    await writeFragment(fragment2);

    //This test also checks that whatever we put/write can be read with readFragment()
    const result = await readFragment(ownerId, fragment.id);
    expect(result).toEqual(fragment2);
  });

  test('writeFragmentData() updates the metadata if already exists for given ids', async () => {
    const id = 'b';
    const buffer = Buffer.from([1, 2, 3]);

    await writeFragmentData(ownerId, id, buffer);

    const buffer2 = Buffer.from([9, 99, 999]);
    await writeFragmentData(ownerId, id, buffer2);

    //This test also checks that whatever we put/write can be read with readFragmentData()
    const result = await readFragmentData(ownerId, id);
    expect(result).toEqual(buffer2);
  });

  test('writeFragment() requires mandatory properties', () => {
    const fragment = { id: 'b', content: 'temp-data' };
    expect(async () => await writeFragment(fragment)).rejects.toThrow();
  });

  test('writeFragmentData() requires mandatory properties', () => {
    const buffer = Buffer.from([1, 2, 3]);
    expect(async () => await writeFragmentData(ownerId, buffer)).rejects.toThrow();
  });

  test('writeFragment() expects string', () => {
    const fragment = { ownerId, id: 2, content: 'temp-data' };
    expect(async () => await writeFragment(fragment)).rejects.toThrow();
  });

  test('writeFragmentData() expects string', () => {
    const id = 2232;
    const buffer = Buffer.from([1, 2, 3]);
    expect(async () => await writeFragmentData(ownerId, id, buffer)).rejects.toThrow();
  });

  test('readFragment() returns undefined if no metadata exists for given ids', async () => {
    const fragment = { ownerId, id: 't' };
    const result = await readFragment(fragment.ownerId, fragment.id);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns undefined if no data exists for given ids', async () => {
    const id = 't';
    const result = await readFragment(ownerId, id);
    expect(result).toBe(undefined);
  });

  test('readFragment() requires mandatory properties', async () => {
    const fragment = { ownerId, id: 'b', content: 'temp-data' };
    expect(async () => await readFragment(fragment.id)).rejects.toThrow();
  });

  test('readFragmentData() requires mandatory properties', async () => {
    expect(async () => await readFragmentData(ownerId)).rejects.toThrow();
  });

  test('readFragment() with incorrect secondaryKey returns nothing', async () => {
    const fragment = { ownerId, id: 'b', content: 'temp-data' };
    await writeFragment(fragment);

    const fragment2 = { ownerId, id: 'z' };
    const result = await readFragment(fragment2.ownerId, fragment2.id);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() with incorrect secondaryKey returns nothing', async () => {
    const id = 'b';
    const id2 = 'p';
    const buffer = Buffer.from([1, 2, 3]);
    await writeFragmentData(ownerId, id, buffer);

    const result = await readFragmentData(ownerId, id2);
    expect(result).toBe(undefined);
  });

  test('readFragment() expects string', () => {
    const fragment = { ownerId: 1, id: 2, content: 'temp-data' };
    expect(async () => await readFragment(fragment.ownerId, fragment.id)).rejects.toThrow();
  });

  test('readFragmentData() expects string', () => {
    const ownerId = 1;
    const id = 22;
    expect(async () => await readFragmentData(ownerId, id)).rejects.toThrow();
  });

  test('listFragments() returns fragments ids while expand is false', async () => {
    const fragments = [
      { id: 'aaaa', content: 'temp-data1' },
      { id: 'bbb', content: 'temp-data2' },
      { id: 'cc', content: 'temp-data3' },
    ];

    for (const fragment of fragments) {
      fragment.ownerId = ownerId;
      await writeFragment(fragment);
    }

    const result = await listFragments(ownerId);
    const mappedIds = fragments.map((fragment) => fragment.id);
    expect(result).toEqual(expect.arrayContaining(mappedIds));
  });

  test('listFragments() returns fragments object while expand is true', async () => {
    const fragments = [
      { id: 'a', content: 'temp-data1' },
      { id: 'b', content: 'temp-data2' },
      { id: 'c', content: 'temp-data3' },
    ];

    for (const fragment of fragments) {
      fragment.ownerId = ownerId;
      await writeFragment(fragment);
    }

    const result = await listFragments(ownerId, true);
    expect(result).toEqual(expect.arrayContaining(fragments));
  });

  test('listFragments() expects a string', () => {
    const ownerId = 11;
    expect(async () => await listFragments(ownerId)).rejects.toThrow();
  });

  test('deleteFragment() deletes the values and verify that data is not present', async () => {
    const id = 'b';
    const fragment = { ownerId, id, content: 'temp-data' };
    const buffer = Buffer.from([1, 2, 3]);

    await writeFragment(fragment);
    await writeFragmentData(ownerId, id, buffer);

    await deleteFragment(ownerId, id);

    const metadata = await readFragment(ownerId, id);
    const data = await readFragmentData(ownerId, id);

    expect(metadata).toBe(undefined);
    expect(data).toBe(undefined);
  });

  test('deleFragments() expects a string', () => {
    const ownerId = '9';
    const id = '1';
    expect(async () => await deleteFragment(ownerId, id)).rejects.toThrow();
  });
});

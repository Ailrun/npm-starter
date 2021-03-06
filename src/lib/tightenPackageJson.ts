/**
 * Copyright 2018-present Junyoung Clare Jang
 */
import { fromUrl } from 'hosted-git-info';

import { PackageJson, TypeUtils } from '../types';

export const tightenPackageJson = (
  packageJson: PackageJson,
): PackageJson.Normalized => {
  const result: TypeUtils.Writable<PackageJson.Normalized.WellKnown> = {
    name: packageJson.name,
    version: packageJson.version,
  };

  if (packageJson.bugs) {
    result.bugs = tightenBugs(packageJson.bugs);
  }

  if (packageJson.author) {
    try {
      result.author = tightenPeople(packageJson.author);
    } catch (e) {
      throw new Error('Author field is not valid');
    }
  }

  if (packageJson.contributors) {
    try {
      result.contributors = packageJson.contributors.map(tightenPeople);
    } catch (e) {
      throw new Error('Contributors field is not valid');
    }
  }

  if (packageJson.bin) {
    result.bin = tightenBin(packageJson.name, packageJson.bin);
  }

  if (packageJson.man) {
    result.man = tightenMan(packageJson.man);
  }

  if (packageJson.repository) {
    result.repository = tightenRepository(packageJson.repository);
  }

  return {
    ...packageJson as any,
    ...result,
  };
};

const tightenBugs = (
  bugs: PackageJson.Bugs,
): PackageJson.Normalized.Bugs => {
  if (typeof bugs !== 'string') {
    return bugs;
  }

  return {
    url: bugs,
  };
};

const tightenPeople = (
  people: PackageJson.Author,
): PackageJson.People => {
  if (typeof people !== 'string') {
    return people;
  }

  return parsePeople(people);
};

const parsePeople = (
  people: string,
): PackageJson.People => {
  const match = people.match(/([^<(]*) *(?:<(.*)>)? *(?:\((.*)\))?/);
  if (match === null) {
    throw new Error('Field is not a valid people');
  }

  const [ , name, email, url ] = match;
  const result: TypeUtils.Writable<PackageJson.People> = {
    name: name.trim(),
  };

  if (email) {
    result.email = email;
  }

  if (url) {
    result.url = url;
  }

  return result;
};

const tightenBin = (
  packageName: string,
  bin: PackageJson.Bin,
): PackageJson.Normalized.Bin => {
  if (typeof bin !== 'string') {
    return bin;
  }

  return {
    [packageName]: bin,
  };
};

const tightenMan = (
  man: PackageJson.Man,
): PackageJson.Normalized.Man => {
  if (typeof man !== 'string') {
    return man;
  }

  return [
    man,
  ];
};

const tightenRepository = (
  repository: PackageJson.Repository,
): PackageJson.Normalized.Repository => {
  let result: any;

  if (typeof repository === 'string') {
    result = {
      type: 'git',
      url: repository || '',
    };
  } else {
    result = {
      ...repository,
    };
  }

  if (result.url) {
    const hosted = fromUrl(result.url);
    if (hosted) {
      result.url =
        hosted.getDefaultRepresentation() === 'shortcut' ?
        hosted.https() :
        hosted.toString();
    }
  }

  return result;
};

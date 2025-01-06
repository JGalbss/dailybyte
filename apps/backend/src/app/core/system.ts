/**
 * System properties enum for environment variables
 */
export enum SystemProp {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',
  REDIS_URL = 'REDIS_URL',
  NEWS_API_KEY = 'NEWS_API_KEY',
  SCRAPFLY_API_KEY = 'SCRAPFLY_API_KEY',
}

const systemPropDefaultValues: Partial<Record<SystemProp, string>> = {};

export const system = {
  get<T extends string>(prop: SystemProp): T | undefined {
    return getEnvVar(prop) as T | undefined;
  },

  getNumber(prop: SystemProp): number | null {
    const stringNumber = getEnvVar(prop);
    if (!stringNumber) {
      return null;
    }
    const parsedNumber = Number.parseInt(stringNumber, 10);
    if (Number.isNaN(parsedNumber)) {
      return null;
    }
    return parsedNumber;
  },

  getBoolean(prop: SystemProp): boolean | undefined {
    const value = getEnvVar(prop);
    if (value === undefined) {
      return undefined;
    }
    return value === 'true';
  },

  getOrThrow<T extends string>(prop: SystemProp): T {
    const value = getEnvVar(prop) as T | undefined;
    if (value === undefined) {
      throw new Error(`System property ${prop} is not defined.`);
    }
    return value;
  },
};

const getEnvVar = (prop: SystemProp): string | undefined => {
  return process.env[`${prop}`] ?? systemPropDefaultValues[prop];
};

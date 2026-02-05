import { TimeProvider, defaultTimeProvider } from '@/app/core/time/time.service';
import { Flag, FlagType } from '@/app/features/flags/models/flag.model';
import { EnvironmentFlagValue, FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

/**
 * Get the default value for a given flag type
 */
export const getDefaultForType = <T extends FlagType>(type: T): FlagTypeMap[T] => {
  const defaults: FlagTypeMap = {
    boolean: false,
    string: '',
    number: 0,
    json: {},
  };
  return defaults[type] as FlagTypeMap[T];
};

/**
 * Validate that a value matches the expected flag type
 */
export const validateValueType = (type: FlagType, value: unknown): boolean => {
  switch (type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'json':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return false;
  }
};

/**
 * Get the effective value for a flag in a specific environment.
 * Falls back to default value if no environment-specific value exists.
 */
export const getEffectiveValue = <T extends FlagType>(
  flag: Flag,
  environmentId: string,
): FlagTypeMap[T] => {
  const envValue = flag.environmentValues[environmentId];
  return (envValue?.value ?? flag.defaultValue) as FlagTypeMap[T];
};

/**
 * Check if flag is enabled in a specific environment
 */
export const isEnabledInEnvironment = (flag: Flag, environmentId: string): boolean => {
  const envValue = flag.environmentValues[environmentId];
  return envValue?.enabled ?? false;
};

/**
 * Create an environment flag value with proper defaults
 */
export const createEnvironmentValue = <T extends FlagType>(
  flagId: string,
  environmentId: string,
  type: T,
  value?: FlagTypeMap[T],
  timeProvider: TimeProvider = defaultTimeProvider,
): EnvironmentFlagValue<T> => ({
  environmentId,
  flagId,
  value: value ?? getDefaultForType(type),
  enabled: false,
  segmentKeys: [],
  updatedAt: timeProvider.now(),
});

/**
 * Update a flag's environment value immutably
 */
export const updateFlagEnvironmentValue = <T extends FlagType>(
  flag: Flag,
  environmentId: string,
  value: FlagTypeMap[T],
  enabled?: boolean,
  timeProvider: TimeProvider = defaultTimeProvider,
): Flag => {
  const existingEnvValue = flag.environmentValues[environmentId];
  const stamp = timeProvider.now();

  return {
    ...flag,
    environmentValues: {
      ...flag.environmentValues,
      [environmentId]: {
        environmentId,
        flagId: flag.id,
        value,
        enabled: enabled ?? existingEnvValue?.enabled ?? false,
        segmentKeys: existingEnvValue?.segmentKeys ?? [],
        updatedAt: stamp,
      },
    },
    updatedAt: stamp,
  };
};

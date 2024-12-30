/**
 * Utility functions for code execution in isolated VM
 */

/**
 * Creates the base context utilities needed for test case execution
 * @returns JavaScript code containing utility functions as a string
 */
export function createContextUtils(): string {
  return `
    // Console logging utilities
    const console = {
      log: (...args) => log(args),
      info: (...args) => log(args),
      warn: (...args) => log(args),
      error: (...args) => log(args)
    };

    // Deep equality comparison for test cases
    function assertEqual(actual, expected) {
      const stringify = (val) => {
        try {
          return JSON.stringify(val);
        } catch {
          return String(val);
        }
      };

      if (actual === expected) return true;
      
      if (Array.isArray(actual) && Array.isArray(expected)) {
        if (actual.length !== expected.length) return false;
        return actual.every((item, index) => assertEqual(item, expected[index]));
      }
      
      if (typeof actual === 'object' && typeof expected === 'object') {
        if (actual === null || expected === null) return actual === expected;
        const actualKeys = Object.keys(actual);
        const expectedKeys = Object.keys(expected);
        if (actualKeys.length !== expectedKeys.length) return false;
        return actualKeys.every(key => assertEqual(actual[key], expected[key]));
      }
      
      return false;
    }

    // Test case execution wrapper with additional safety checks
    function executeTestCase(code, input, expected) {
      try {
        eval(code);
        
        if (typeof solution !== 'function') {
          throw new Error('Solution function is not defined');
        }
        
        const result = solution(input);
        log('Result:', result);
        
        return {
          success: assertEqual(result, expected),
          output: result
        };
      } catch (err) {
        log('Error:', err.message);
        return {
          success: false,
          output: null,
          error: err.message
        };
      }
    }
  `;
}

/**
 * Validates and sanitizes code before execution
 */
export function validateAndSanitizeCode(code: string): string {
  // Remove code fences if present
  const cleanCode = code.replace(/^```(javascript)?\n|```$/g, '').trim();

  try {
    // validate syntax
    new Function(cleanCode);
    return cleanCode;
  } catch (err) {
    throw new Error(
      `Invalid JavaScript syntax: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
  }
}

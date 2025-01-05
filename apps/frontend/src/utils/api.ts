import { Submission } from '@dailybyte/shared';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO: we should use the types from the shared library
export type SubmitSolutionResponse = {
  success: boolean;
  submission: Submission;
  attemptCount: number;
};

export const Api = {
  problem: {
    getActive: async () => {
      const response = await fetch(`${BASE_URL}/problem/active`);
      return response.json().then((data) => data.problem);
    },
  },

  submitSolution: async (code: string, problemId: string) => {
    const response = await fetch(`${BASE_URL}/problem/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, problemId }),
    });
    return response.json().then((data) => data as SubmitSolutionResponse);
  },
};

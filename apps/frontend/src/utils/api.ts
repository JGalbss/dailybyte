export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const Api = {
  problem: {
    getActive: async () => {
      const response = await fetch(`${BASE_URL}/problem/active`);
      return response.json();
    },
  },
};

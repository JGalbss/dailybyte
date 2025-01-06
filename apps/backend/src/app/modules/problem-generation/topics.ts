import { system, SystemProp } from '../../core/system';

// lmao ya i know but im bored, reccomend not putting a fetch in a constants file
export const getNewsHeadlines = async (): Promise<
  {
    title: string;
    description: string;
  }[]
> => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${system.get(
        SystemProp.NEWS_API_KEY,
      )}`,
    );

    const data: {
      status: string;
      totalResults: number;
      articles: Array<{
        source: {
          id: string | null;
          name: string;
        };
        author: string;
        title: string;
        description: string;
        url: string;
        urlToImage: string;
        publishedAt: string;
        content: string;
      }>;
    } = await response.json();

    return data.articles.map((article) => ({
      title: article.title,
      description: article.description,
    }));
  } catch (err) {
    console.error('Failed to fetch news topics:', err);
    return [];
  }
};

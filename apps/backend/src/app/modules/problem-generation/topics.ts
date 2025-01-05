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

// tons of topics, i know kek
export const PROBLEM_TOPICS = {
  dataStructures: [
    'Binary Search Tree Implementation',
    'Custom Hash Table',
    'Priority Queue',
    'Trie for Autocomplete',
    'LRU Cache Implementation',
    'Graph Representation',
    'Disjoint Set Union',
    'AVL Tree Implementation',
    'Red-Black Tree',
    'Skip List',
    'Bloom Filter',
    'B-Tree Implementation',
    'Segment Tree',
    'Fenwick Tree',
    'Circular Buffer',
  ],
  algorithms: [
    'Merge Sort Implementation',
    'Quick Sort Implementation',
    'Binary Search Variations',
    'Depth First Search',
    'Breadth First Search',
    'Dijkstra Shortest Path',
    'Dynamic Programming',
    'Backtracking Problems',
    'Two Pointer Technique',
    'Sliding Window',
    'Greedy Algorithms',
    'A* Pathfinding Algorithm',
    'Bellman-Ford Algorithm',
    'Floyd-Warshall Algorithm',
    'Topological Sort',
    "Kruskal's Algorithm",
    "Prim's Algorithm",
    'KMP String Matching',
    'Rabin-Karp Algorithm',
    'Longest Increasing Subsequence',
  ],
  string: [
    'String Pattern Matching',
    'Palindrome Detection',
    'String Compression',
    'Anagram Grouping',
    'Longest Common Substring',
    'Regular Expression Matching',
    'String Rotation',
    'Longest Palindromic Substring',
    'Edit Distance',
    'String Interleaving',
    'Word Break Problem',
    'Wildcard Pattern Matching',
    'Longest Repeating Substring',
  ],
  array: [
    'Array Rotation',
    'Subarray Sum Problems',
    'Matrix Operations',
    'Interval Merging',
    'Dutch National Flag',
    "Kadane's Algorithm",
    'Majority Element',
    'Next Permutation',
    'Spiral Matrix Traversal',
    'Trapping Rain Water',
    'Maximum Product Subarray',
    'Find Missing Number',
    'Search in Rotated Array',
    'Median of Two Sorted Arrays',
    'Jump Game Variations',
  ],
  optimization: [
    'Rate Limiter Implementation',
    'Memory Usage Optimization',
    'CPU Scheduling Simulation',
    'Cache Implementation',
    'Load Balancer Logic',
    'Database Query Optimization',
    'Network Packet Routing',
    'Thread Pool Implementation',
    'Memory Pool Design',
    'Garbage Collection Algorithm',
    'Connection Pooling',
    'Task Scheduler Implementation',
    'Resource Allocation Algorithm',
    'Caching Strategies',
    'Distributed System Design',
  ],
} as const;

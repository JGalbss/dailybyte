import { Languages } from '@dailybyte/shared';

export const SOLUTION_TEMPLATE: Record<Languages, string> = {
  [Languages.JavaScript]: `// DO NOT MODIFY THE FIRST LINE
function solution(input) {
    // Your solution here
}`,
  [Languages.Python]: `# DO NOT MODIFY THE FIRST LINE
def solution(input):
    # Your solution here
    pass`,
};

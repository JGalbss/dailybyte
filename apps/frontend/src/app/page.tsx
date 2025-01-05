import { Api } from '../utils/api';
import { ProblemGroup } from './(components)/ProblemGroup';

export default async function Main() {
  // get active problem
  const problem = await Api.problem.getActive();

  return <ProblemGroup problem={problem} />;
}

import Lambda from '../../utils/lambda'


export async function services() {
  const result = await Lambda.listFunctions()
  return result.Functions
}


export async function service({ FunctionName }) {
  const result = await Lambda.listFunctions()
  return result.Functions.filter(func => func.FunctionName === FunctionName)[0]
}

import Lambda from '../../utils/lambda'


export async function services() {
  const result = await Lambda.listFunctions()
  return result.Functions
}

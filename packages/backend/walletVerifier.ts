import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import axios from "axios";

// Query is hard-coded now. It should be configurable.
const endpoint =
  "https://api.thegraph.com/subgraphs/name/messari/quickswap-polygon";

const tokensQuery = `
query Account($address: String!) {
account(id: $address) {
  id
}
}
`;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const address = event.pathParameters?.address;

  const graphqlQuery = {
    query: tokensQuery,
    variables: { address },
  };

  const response = await axios({
    url: endpoint,
    method: "POST",
    headers: { "content-type": "application/json" },
    data: graphqlQuery,
  });

  const account = response.data?.data?.account;

  return {
    statusCode: 200,
    body: JSON.stringify({ eligible: !!account }),
  };
};

// GraphQL Queries
export const url = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

export const userIdQuery = `
  query {
    user {
      id
    }
  }
`;

export const userQuery = (userId) => `
  {
    user(where: { id: { _eq: "${userId}" } }) {
      login
      campus
      email
      firstName
      lastName
    }
  }
`;

export const xpQuery = (userId) => `
  query Transaction_aggregate {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
        userId: { _eq: "${userId}" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const currentProjectQuery = `
  {
    progress(
      where: { isDone: { _eq: false }, object: { type: { _eq: "project" } } }
      limit: 1
    ) {
      object {
        name
      }
    }
  }
`;

export const lastProjectsQuery = `
{
    transaction(
      where: {
        type: { _eq: "xp" }
        _and: [
          { path: { _like: "/bahrain/bh-module%" } },
          { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
          { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
        ]
      }
      order_by: { createdAt: desc }
      limit: 4
    ) {
      object {
        type
        name
      }
    }
  }
`;

export const skillsQuery = `
  {
    user {
      transactions(where: {
          type: {_ilike: "%skill%"}
        }
      ) {
        type
        amount
      }
    }
  }
`;

export const auditQuery = (userId) => `
{
  user(where: { id: { _eq: "${userId}" } }) {
    auditRatio
    totalUp
    totalDown
  }
}
`;
